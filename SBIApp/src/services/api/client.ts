// src/services/api/client.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { secureStorage } from '../storage/secureStorage';
import { API_CONFIG } from '../../config/apiConfig';
import { API_ENDPOINTS } from '../../config/api';
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
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Platform': Platform.OS,
      },
    });
    this.setupInterceptors();
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // ✅ Request interceptor - Add token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await secureStorage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ✅ Response interceptor - Handle 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If no response or 401 on login/register, don't retry
        if (!error.response || 
            error.response.status !== 401 ||
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest._retry) {
          return Promise.reject(error);
        }

        // Handle token refresh
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
              message: 'No refresh token available',
              code: 'SESSION_EXPIRED',
            });
          }

          const response = await this.client.post(API_ENDPOINTS.auth.refresh, {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
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
    );
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = ApiClient.getInstance().getClient();