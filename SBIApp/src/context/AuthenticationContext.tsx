// src/context/AuthenticationContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, AppState } from 'react-native';
import { secureStorage } from '../services/storage/secureStorage';
import { authService } from '../services';
import { User, UserRole } from '../types';
import { showToast } from '../components/Toast';

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

const AuthenticationContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthenticationContext);
  if (!context) throw new Error('useAuth must be used within AuthenticationProvider');
  return context;
};

export const AuthenticationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        refreshUserData();
      }
    });
    return () => subscription.remove();
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

      const updatedUser = await authService.getCurrentUser();
      await secureStorage.setUserData('user', updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.warn('Failed to refresh user data:', error);
    }
  };

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password, role });
      setUser(response.user);
      showToast('Login successful!', 'success');
    } catch (error: any) {
      console.error('Login error:', error);
      showToast(error.message || 'Login failed', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      showToast('Registration successful!', 'success');
    } catch (error: any) {
      console.error('Registration error:', error);
      showToast(error.message || 'Registration failed', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  const verifySession = async (): Promise<boolean> => {
    return await authService.verifySession();
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update user:', error);
      showToast('Failed to update profile', 'error');
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