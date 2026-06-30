import { apiClient } from './api/client';
import { secureStorage } from './storage/secureStorage';
import { SecurityUtils } from '../utils/securityUtils';
import { User, UserRole } from '../types';
import { API_ENDPOINTS } from '../config/api';

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  businessName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const validatedEmail = SecurityUtils.validateEmail(credentials.email);
    if (!validatedEmail) throw new Error('Invalid email format');
    
    const passwordCheck = SecurityUtils.validatePassword(credentials.password);
    if (!passwordCheck.valid) throw new Error(passwordCheck.message);

    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, {
      email: SecurityUtils.sanitizeInput(credentials.email),
      password: credentials.password,
      role: credentials.role,
    });
    
    await secureStorage.setToken(response.data.token);
    await secureStorage.setUserData('user', response.data.user);
    
    return response.data;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    if (!SecurityUtils.validateEmail(userData.email)) throw new Error('Invalid email format');
    const passwordCheck = SecurityUtils.validatePassword(userData.password);
    if (!passwordCheck.valid) throw new Error(passwordCheck.message);
    
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, {
      email: SecurityUtils.sanitizeInput(userData.email),
      password: userData.password,
      full_name: SecurityUtils.sanitizeInput(userData.fullName),
      role: userData.role,
      business_name: userData.businessName ? SecurityUtils.sanitizeInput(userData.businessName) : undefined,
    });
    
    await secureStorage.setToken(response.data.token);
    await secureStorage.setUserData('user', response.data.user);
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      console.error('Logout API error:', error);
    }
    await secureStorage.clearAll();
  }

  async refreshToken(): Promise<string> {
    const response = await apiClient.post<{ token: string }>(API_ENDPOINTS.auth.refresh);
    await secureStorage.setToken(response.data.token);
    return response.data.token;
  }

  async forgotPassword(email: string): Promise<void> {
    if (!SecurityUtils.validateEmail(email)) throw new Error('Invalid email format');
    await apiClient.post(API_ENDPOINTS.auth.forgotPassword, {
      email: SecurityUtils.sanitizeInput(email),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const passwordCheck = SecurityUtils.validatePassword(newPassword);
    if (!passwordCheck.valid) throw new Error(passwordCheck.message);
    
    await apiClient.post(API_ENDPOINTS.auth.resetPassword, {
      token,
      new_password: newPassword,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.verifyEmail, { token });
  }
}

export default new AuthService();