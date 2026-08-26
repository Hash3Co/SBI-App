// src/services/authService.ts
import { apiClient } from './api/client';
import { secureStorage } from './storage/secureStorage';
import { SecurityUtils } from '../utils/securityUtils';
import { User, UserRole } from '../types';
import { API_ENDPOINTS } from '../config/api';
import { showToast } from '../components/Toast';

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
  access: string;
  refresh: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login for:', credentials.email);
      
      const validatedEmail = SecurityUtils.validateEmail(credentials.email);
      if (!validatedEmail) throw new Error('Invalid email format');
      
      const passwordCheck = SecurityUtils.validatePassword(credentials.password);
      if (!passwordCheck.valid) throw new Error(passwordCheck.message);

      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, {
        email: SecurityUtils.sanitizeInput(credentials.email),
        password: credentials.password,
        role: credentials.role,
      });

      console.log('✅ Login successful:', response.data.user.email);

      // Store tokens and user data
      await secureStorage.setToken(response.data.access);
      if (response.data.refresh) {
        await secureStorage.setRefreshToken(response.data.refresh);
      }
      await secureStorage.setUserData('user', response.data.user);
      await secureStorage.setLastActivity();
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Login failed',
        status: error.response?.status,
      };
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      
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

      console.log('✅ Registration successful:', response.data.user.email);

      await secureStorage.setToken(response.data.access);
      if (response.data.refresh) {
        await secureStorage.setRefreshToken(response.data.refresh);
      }
      await secureStorage.setUserData('user', response.data.user);
      await secureStorage.setLastActivity();
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Registration failed',
        status: error.response?.status,
      };
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('🚪 Logging out...');
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      console.error('Logout API error:', error);
    }
    await secureStorage.clearAll();
    console.log('✅ Logout complete');
  }

  async getCurrentUser(): Promise<User> {
    try {
      console.log('👤 Fetching current user...');
      const response = await apiClient.get<User>(API_ENDPOINTS.auth.me);
      console.log('✅ User fetched:', response.data.email);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch user:', error);
      throw {
        message: error.response?.data?.message || 'Failed to fetch user',
        status: error.response?.status,
      };
    }
  }

  async verifySession(): Promise<boolean> {
    try {
      const token = await secureStorage.getToken();
      if (!token) return false;
      
      await apiClient.get(API_ENDPOINTS.auth.verify);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new AuthService();