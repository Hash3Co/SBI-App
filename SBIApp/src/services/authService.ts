// src/services/authService.ts
import { apiClient } from './api/client';
import { secureStorage } from './storage/secureStorage';
import { API_ENDPOINTS } from '../config/api';

export interface LoginCredentials {
  email: string;
  password: string;
  role?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: string;
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
      
      // Store tokens
      await secureStorage.setToken(response.data.access);
      await secureStorage.setRefreshToken(response.data.refresh);
      await secureStorage.setUserData('user', response.data.user);
      await secureStorage.setLastActivity();
      
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
      
      // Store tokens
      await secureStorage.setToken(response.data.access);
      await secureStorage.setRefreshToken(response.data.refresh);
      await secureStorage.setUserData('user', response.data.user);
      await secureStorage.setLastActivity();
      
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

  // ✅ FIX: Use GET for profile, not update endpoint
  async getProfile() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.auth.profile);
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // ✅ FIX: Use PUT for profile update
  async updateProfile(data: any) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.auth.profile, data);
      await secureStorage.setUserData('user', response.data);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async verifySession() {
    try {
      const token = await secureStorage.getToken();
      if (!token) return false;
      
      await apiClient.get(API_ENDPOINTS.auth.verify);
      return true;
    } catch (error) {
      return false;
    }
  }

  async refreshToken() {
    try {
      const refreshToken = await secureStorage.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');
      
      const response = await apiClient.post(API_ENDPOINTS.auth.refresh, {
        refresh: refreshToken,
      });
      
      await secureStorage.setToken(response.data.access);
      return response.data.access;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }
}

export default new AuthService();