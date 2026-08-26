// src/services/authService.ts
import { apiClient } from './api/client';
import { secureStorage } from './storage/secureStorage';
import { API_ENDPOINTS } from '../config/api';
import { User, UserRole } from '../types';

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

class AuthService {
  async login(credentials: LoginCredentials) {
    try {
      console.log('🔐 Login attempt:', credentials.email);
      
      const response = await apiClient.post(API_ENDPOINTS.auth.login, {
        email: credentials.email,
        password: credentials.password,
      });
      
      console.log('✅ Login successful');
      
      await secureStorage.setToken(response.data.access);
      await secureStorage.setRefreshToken(response.data.refresh);
      await secureStorage.setUserData('user', response.data.user);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Login error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Login failed' };
    }
  }

  async register(userData: RegisterData) {
    try {
      console.log('📝 Registration attempt:', userData.email);
      
      const response = await apiClient.post(API_ENDPOINTS.auth.register, {
        email: userData.email,
        password: userData.password,
        password2: userData.password,
        full_name: userData.fullName,
        role: userData.role,
        business_name: userData.businessName,
      });
      
      console.log('✅ Registration successful');
      
      await secureStorage.setToken(response.data.access);
      await secureStorage.setRefreshToken(response.data.refresh);
      await secureStorage.setUserData('user', response.data.user);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Registration failed' };
    }
  }

  async logout() {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    }
    await secureStorage.clearAll();
  }

  async getCurrentUser() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.auth.profile);
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }
}

export default new AuthService();