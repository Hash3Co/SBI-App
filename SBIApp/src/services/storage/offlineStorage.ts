// src/services/storage/offlineStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export class OfflineStorage {
  static async cacheData(key: string, data: any, ttl: number = 3600000): Promise<void> {
    const item = { data, timestamp: Date.now(), ttl };
    await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(item));
  }

  static async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(`cache_${key}`);
      if (!item) return null;
      const parsed = JSON.parse(item);
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }
      return parsed.data;
    } catch {
      return null;
    }
  }

  static async clearCache(key?: string): Promise<void> {
    if (key) {
      await AsyncStorage.removeItem(`cache_${key}`);
    } else {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    }
  }
}