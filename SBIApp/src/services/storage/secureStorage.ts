// src/services/storage/secureStorage.ts
import * as Keychain from 'react-native-keychain';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Platform } from 'react-native';

export class SecureStorage {
  private static instance: SecureStorage;
  private readonly AUTH_SERVICE = 'com.sbiapp.auth';
  private readonly REFRESH_SERVICE = 'com.sbiapp.refresh';
  private readonly USER_KEY = 'user_data';
  private readonly PROFILE_KEY = 'profile_data';
  private readonly ACTIVITY_KEY = 'last_activity';
  
  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  // Store JWT token with biometric protection
  async setToken(token: string): Promise<void> {
    if (!token || token.length < 10) {
      throw new Error('Invalid token');
    }
    
    try {
      await Keychain.setGenericPassword('auth_token', token, {
        service: this.AUTH_SERVICE,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        ...(Platform.OS === 'android' && {
          securityLevel: Keychain.SECURITY_LEVEL.ANY,
        }),
      });
    } catch (error) {
      console.error('Failed to store token:', error);
      throw new Error('Unable to securely store token');
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ 
        service: this.AUTH_SERVICE 
      });
      return credentials ? credentials.password : null;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  // Store refresh token
  async setRefreshToken(token: string): Promise<void> {
    if (!token) return;
    
    try {
      await Keychain.setGenericPassword('refresh_token', token, {
        service: this.REFRESH_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        ...(Platform.OS === 'android' && {
          securityLevel: Keychain.SECURITY_LEVEL.ANY,
        }),
      });
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ 
        service: this.REFRESH_SERVICE 
      });
      return credentials ? credentials.password : null;
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  // Store user data encrypted
  async setUserData<T>(key: string, data: T): Promise<void> {
    if (!key) throw new Error('Storage key required');
    
    try {
      const encrypted = JSON.stringify(data);
      await EncryptedStorage.setItem(`user_${key}`, encrypted);
    } catch (error) {
      console.error('Failed to store user data:', error);
      throw new Error('Unable to securely store user data');
    }
  }

  async getUserData<T>(key: string): Promise<T | null> {
    try {
      const data = await EncryptedStorage.getItem(`user_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  // Activity tracking methods
  async setLastActivity(): Promise<void> {
    try {
      const timestamp = Date.now().toString();
      await EncryptedStorage.setItem(this.ACTIVITY_KEY, timestamp);
    } catch (error) {
      console.error('Failed to set last activity:', error);
    }
  }

  async getLastActivity(): Promise<number> {
    try {
      const timestamp = await EncryptedStorage.getItem(this.ACTIVITY_KEY);
      return timestamp ? parseInt(timestamp, 10) : Date.now();
    } catch (error) {
      console.error('Failed to get last activity:', error);
      return Date.now();
    }
  }

  // Check if session is expired
  async isSessionExpired(timeoutMinutes: number = 15): Promise<boolean> {
    try {
      const lastActivity = await this.getLastActivity();
      const now = Date.now();
      const timeoutMs = timeoutMinutes * 60 * 1000;
      return (now - lastActivity) > timeoutMs;
    } catch (error) {
      console.error('Failed to check session expiry:', error);
      return true; // Assume expired on error
    }
  }

  // Clear all secure data
  async clearAll(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: this.AUTH_SERVICE });
      await Keychain.resetGenericPassword({ service: this.REFRESH_SERVICE });
      await EncryptedStorage.clear();
    } catch (error) {
      console.error('Failed to clear secure data:', error);
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export const secureStorage = SecureStorage.getInstance();