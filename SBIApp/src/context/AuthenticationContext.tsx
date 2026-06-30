// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, AppState } from 'react-native';
import { secureStorage } from '../services/storage/secureStorage';
import { apiClient } from '../services/api/client';
import { User, UserRole } from '../types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  verifySession: () => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  businessName?: string;
}

interface AuthResponse {
  access: string;
  refresh?: string;
  user?: {
    id?: string;
    email?: string;
    role?: UserRole;
    full_name?: string;
    fullName?: string;
    is_verified?: boolean;
    isVerified?: boolean;
    created_at?: string;
    createdAt?: string;
    updated_at?: string;
    updatedAt?: string;
    business_name?: string;
    businessName?: string;
  };
  user_id?: string;
  full_name?: string;
  created_at?: string;
  updated_at?: string;
  is_verified?: boolean;
  business_name?: string;
}

const AuthenticationContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthenticationProvider');
  }
  return context;
};

export const AuthenticationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to safely get boolean values
  const getBoolean = (value: any, defaultValue: boolean = false): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value === 'true' || value === 'True' || value === '1';
    }
    if (typeof value === 'number') return value === 1;
    return defaultValue;
  };

  // Helper function to map user data from backend
  const mapUserData = (data: any): User => {
    // Check if data has a nested user object
    const userData = data.user || data;
    
    return {
      id: userData.id || userData.user_id || uuidv4(),
      email: userData.email || '',
      role: userData.role || userData.user_type || 'sme',
      fullName: userData.full_name || userData.fullName || '',
      isVerified: getBoolean(
        userData.is_verified ?? 
        userData.isVerified ?? 
        userData.email_verified ?? 
        userData.emailVerified,
        true
      ),
      createdAt: userData.created_at || userData.createdAt || new Date().toISOString(),
      updatedAt: userData.updated_at || userData.updatedAt || new Date().toISOString(),
    };
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        refreshUserData();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await secureStorage.getToken();
      const savedUser = await secureStorage.getUserData<User>('user');

      if (token && savedUser) {
        setUser(savedUser);
        await refreshUserData();
      } else {
        await secureStorage.clearAll();
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await secureStorage.clearAll();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const token = await secureStorage.getToken();
      if (!token) return;

      const response = await apiClient.get('/auth/me/');
      if (response.data) {
        const updatedUser = mapUserData(response.data);
        await secureStorage.setUserData('user', updatedUser);
        setUser(updatedUser);
      }
    } catch (error) {
      console.warn('Failed to refresh user data:', error);
    }
  };

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login/', {
        email,
        password,
        role,
      });

      if (!response.data || !response.data.access) {
        throw new Error('Invalid login response');
      }

      // Map user data from response
      const userData = mapUserData(response.data);
      
      // Ensure the role from login matches
      if (userData.role !== role) {
        console.warn('Role mismatch:', { expected: role, received: userData.role });
      }

      // Store tokens
      await secureStorage.setToken(response.data.access);
      if (response.data.refresh) {
        await secureStorage.setRefreshToken(response.data.refresh);
      }
      
      await secureStorage.setUserData('user', userData);
      setUser(userData);

    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Unable to login. Please try again.';
      if (error.response?.data) {
        errorMessage = error.response.data.message || 
                      error.response.data.detail || 
                      error.response.data.error ||
                      errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Login Failed', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const payload: any = {
        email: userData.email,
        password: userData.password,
        full_name: userData.fullName,
        role: userData.role,
      };

      // Only include businessName for SME users
      if (userData.role === 'sme' && userData.businessName) {
        payload.business_name = userData.businessName;
      }

      const response = await apiClient.post<AuthResponse>('/auth/register/', payload);

      if (!response.data || !response.data.access) {
        throw new Error('Invalid registration response');
      }

      // Map user data from response
      const newUser = mapUserData({
        ...response.data,
        // Override with registration data if needed
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
      });

      // Store tokens
      await secureStorage.setToken(response.data.access);
      if (response.data.refresh) {
        await secureStorage.setRefreshToken(response.data.refresh);
      }
      
      await secureStorage.setUserData('user', newUser);
      setUser(newUser);

    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Unable to register. Please try again.';
      if (error.response?.data) {
        errorMessage = error.response.data.message || 
                      error.response.data.detail || 
                      error.response.data.error ||
                      errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Registration Failed', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      try {
        await apiClient.post('/auth/logout/');
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await secureStorage.clearAll();
      setUser(null);
    }
  };

  const verifySession = async (): Promise<boolean> => {
    try {
      const token = await secureStorage.getToken();
      
      if (!token) {
        await logout();
        return false;
      }

      try {
        const response = await apiClient.get('/auth/verify/');
        return response.status === 200;
      } catch (error: any) {
        if (error.response?.status === 401) {
          const refreshToken = await secureStorage.getRefreshToken();
          if (refreshToken) {
            try {
              const refreshResponse = await apiClient.post('/auth/token/refresh/', {
                refresh: refreshToken,
              });
              
              if (refreshResponse.data.access) {
                await secureStorage.setToken(refreshResponse.data.access);
                return true;
              }
            } catch (refreshError) {
              await logout();
              return false;
            }
          } else {
            await logout();
            return false;
          }
        }
        return false;
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      await logout();
      return false;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const updatedUser = { ...user, ...userData };
      await secureStorage.setUserData('user', updatedUser);
      setUser(updatedUser);

      try {
        await apiClient.put('/auth/profile/update/', updatedUser);
      } catch (error) {
        console.warn('Failed to update user on backend:', error);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    verifySession,
    refreshUserData,
    updateUser,
  };

  return (
    <AuthenticationContext.Provider value={value}>
      {children}
    </AuthenticationContext.Provider>
  );
};