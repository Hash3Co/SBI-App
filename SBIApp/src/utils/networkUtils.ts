// src/utils/networkUtils.ts
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import { API_CONFIG } from '../config/apiConfig';

export class NetworkUtils {
  private static createTimeoutSignal(timeoutMs: number): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeoutMs);
    return controller.signal;
  }

  static async checkConnectivity(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } catch {
      return false;
    }
  }

  static async checkBackendHealth(): Promise<{ healthy: boolean; message: string }> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/health/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Short timeout for health check
        signal: NetworkUtils.createTimeoutSignal(5000),
      });
      
      if (response.ok) {
        return { healthy: true, message: 'Backend is healthy' };
      }
      return { healthy: false, message: `Backend returned status: ${response.status}` };
    } catch (error: any) {
      return { 
        healthy: false, 
        message: error.message || 'Cannot connect to backend' 
      };
    }
  }

  static getConnectionInfo(): string {
    return `Platform: ${Platform.OS}\nAPI URL: ${API_CONFIG.baseURL}\nEnvironment: ${__DEV__ ? 'Development' : 'Production'}`;
  }

  static async pingBackend(): Promise<number> {
    const startTime = Date.now();
    try {
      await fetch(`${API_CONFIG.baseURL}/health/`, {
        method: 'HEAD',
        signal: NetworkUtils.createTimeoutSignal(5000),
      });
      return Date.now() - startTime;
    } catch {
      return -1;
    }
  }
}