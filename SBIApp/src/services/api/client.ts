// src/services/api/client.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { secureStorage } from '../storage/secureStorage';
import { API_CONFIG } from '../../config/apiConfig';
import { Platform } from 'react-native';

class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  private constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        ...API_CONFIG.headers,
        'X-Request-ID': this.generateRequestId(),
      },
    });
    this.setupInterceptors();
    this.setupLogging();
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupLogging(): void {
    if (__DEV__) {
      this.client.interceptors.request.use(
        (config) => {
          console.log(`🌐 [${config.method?.toUpperCase()}] ${config.url}`);
          return config;
        },
        (error) => {
          console.error('❌ Request Error:', error);
          return Promise.reject(error);
        }
      );

      this.client.interceptors.response.use(
        (response) => {
          console.log(`✅ [${response.status}] ${response.config.url}`);
          return response;
        },
        (error) => {
          if (error.response) {
            console.error(`❌ [${error.response.status}] ${error.config?.url}`);
            console.error('Response:', error.response.data);
          } else if (error.request) {
            console.error('❌ No response:', error.request);
          } else {
            console.error('❌ Error:', error.message);
          }
          return Promise.reject(error);
        }
      );
    }
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await secureStorage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['X-Request-ID'] = this.generateRequestId();
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Network error
        if (!error.response) {
          return Promise.reject({
            message: 'Network error. Please check your connection.',
            code: 'NETWORK_ERROR',
            status: 0,
          });
        }

        // Handle 401 - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Don't attempt refresh for login/register
          if (originalRequest.url?.includes('/auth/login') || 
              originalRequest.url?.includes('/auth/register')) {
            return Promise.reject(error.response.data);
          }

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => this.client(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await secureStorage.getRefreshToken();
            if (!refreshToken) {
              await secureStorage.clearAll();
              return Promise.reject({
                message: 'Session expired. Please login again.',
                code: 'SESSION_EXPIRED',
              });
            }

            const response = await this.client.post('/auth/refresh/', {
              refresh: refreshToken,
            });

            const newAccessToken = response.data.access || response.data.token;
            if (newAccessToken) {
              await secureStorage.setToken(newAccessToken);
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              
              this.failedQueue.forEach((promise) => promise.resolve());
              this.failedQueue = [];
              
              return this.client(originalRequest);
            }
            throw new Error('No token in refresh response');
          } catch (refreshError) {
            await secureStorage.clearAll();
            this.failedQueue.forEach((promise) => promise.reject(refreshError));
            this.failedQueue = [];
            return Promise.reject({
              message: 'Session expired. Please login again.',
              code: 'SESSION_EXPIRED',
            });
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other errors
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.detail || 
                           error.response?.data?.error ||
                           error.response?.data?.non_field_errors?.[0] ||
                           error.message ||
                           'An error occurred';

        return Promise.reject({
          message: errorMessage,
          status: error.response?.status,
          data: error.response?.data,
          code: error.response?.data?.code || 'UNKNOWN_ERROR',
        });
      }
    );
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = ApiClient.getInstance().getClient();