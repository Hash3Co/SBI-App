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
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Platform': Platform.OS,
        'X-App-Version': '1.0.0',
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
    // Request interceptor - add auth token
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

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If it's not a 401 or it's already a retry, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }

        // If refresh is in progress, queue the request
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
            throw new Error('No refresh token available');
          }

          // Attempt to refresh the token
          const response = await this.client.post('/auth/token/refresh/', {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access || response.data.token;
          if (newAccessToken) {
            // Update stored token
            await secureStorage.setToken(newAccessToken);
            
            // Update authorization header
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            
            // Process queued requests
            this.failedQueue.forEach((promise) => promise.resolve());
            this.failedQueue = [];
            
            // Retry original request
            return this.client(originalRequest);
          } else {
            throw new Error('No token in refresh response');
          }
        } catch (refreshError) {
          // Refresh failed - clear all data and reject queued requests
          await secureStorage.clearAll();
          this.failedQueue.forEach((promise) => promise.reject(refreshError));
          this.failedQueue = [];
          return Promise.reject(refreshError);
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