// src/utils/networkTest.ts
import { API_CONFIG } from '../config/apiConfig';
import { Platform } from 'react-native';

export class NetworkTest {
  static async testBackendConnection(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      console.log('🔍 Testing backend connection...');
      console.log(`📡 URL: ${API_CONFIG.baseURL}/health/`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_CONFIG.baseURL}/health/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend is healthy:', data);
        return {
          success: true,
          message: 'Backend connection successful',
          details: data,
        };
      } else {
        console.error('❌ Backend returned error:', response.status);
        return {
          success: false,
          message: `Backend returned status ${response.status}`,
        };
      }
    } catch (error: any) {
      console.error('❌ Backend connection test failed:', error.message);
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
        details: {
          platform: Platform.OS,
          url: API_CONFIG.baseURL,
        },
      };
    }
  }

  static async testAuthentication(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('🔐 Testing authentication...');
      const response = await fetch(`${API_CONFIG.baseURL}/auth/verify/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        return {
          success: false,
          message: 'Not authenticated (expected if not logged in)',
        };
      }
      
      if (response.ok) {
        return {
          success: true,
          message: 'Authentication works',
        };
      }
      
      return {
        success: false,
        message: `Authentication error: ${response.status}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Auth test failed: ${error.message}`,
      };
    }
  }

  static async runFullDiagnostic(): Promise<{
    backend: any;
    auth: any;
    timestamp: string;
    platform: string;
  }> {
    console.log('🔬 Running full network diagnostic...');
    
    const [backendResult, authResult] = await Promise.all([
      this.testBackendConnection(),
      this.testAuthentication(),
    ]);
    
    const result = {
      backend: backendResult,
      auth: authResult,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
    };
    
    console.log('📊 Diagnostic results:', result);
    return result;
  }
}