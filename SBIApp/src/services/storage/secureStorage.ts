// src/services/storage/secureStorage.ts
import * as Keychain from 'react-native-keychain';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Platform } from 'react-native';

export class SecureStorage {
  private static instance: SecureStorage;
  private readonly AUTH_SERVICE = 'com.nexus4ir.auth';
  private readonly REFRESH_SERVICE = 'com.nexus4ir.refresh';
  private readonly USER_KEY = 'user_data';
  private readonly ACTIVITY_KEY = 'last_activity';
  
  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  async setToken(token: string): Promise<void> {
    if (!token || token.length < 10) {
      throw new Error('Invalid token');
    }
    await Keychain.setGenericPassword('auth_token', token, {
      service: this.AUTH_SERVICE,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  async getToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: this.AUTH_SERVICE });
      return credentials ? credentials.password : null;
    } catch {
      return null;
    }
  }

  async setRefreshToken(token: string): Promise<void> {
    await Keychain.setGenericPassword('refresh_token', token, {
      service: this.REFRESH_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: this.REFRESH_SERVICE });
      return credentials ? credentials.password : null;
    } catch {
      return null;
    }
  }

  async setUserData<T>(key: string, data: T): Promise<void> {
    await EncryptedStorage.setItem(`user_${key}`, JSON.stringify(data));
  }

  async getUserData<T>(key: string): Promise<T | null> {
    try {
      const data = await EncryptedStorage.getItem(`user_${key}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async setLastActivity(): Promise<void> {
    await EncryptedStorage.setItem(this.ACTIVITY_KEY, Date.now().toString());
  }

  async getLastActivity(): Promise<number> {
    try {
      const timestamp = await EncryptedStorage.getItem(this.ACTIVITY_KEY);
      return timestamp ? parseInt(timestamp, 10) : Date.now();
    } catch {
      return Date.now();
    }
  }

  async clearAll(): Promise<void> {
    await Keychain.resetGenericPassword({ service: this.AUTH_SERVICE });
    await Keychain.resetGenericPassword({ service: this.REFRESH_SERVICE });
    await EncryptedStorage.clear();
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export const secureStorage = SecureStorage.getInstance();