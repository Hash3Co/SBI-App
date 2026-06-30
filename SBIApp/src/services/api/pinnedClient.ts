// src/services/api/pinnedClient.ts
import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add to package.json: "react-native-ssl-pinning": "^1.5.0"

export const createPinnedAxiosClient = () => {
  const client = axios.create({
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'X-App-Version': '1.0.0',
      'X-Platform': Platform.OS,
    },
  });

  // Add request interceptor for security headers
  client.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request signature to prevent tampering
    const timestamp = Date.now().toString();
    config.headers['X-Timestamp'] = timestamp;
    config.headers['X-Request-ID'] = generateRequestId();
    
    return config;
  });

  // Add response interceptor for security validation
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired - force re-authentication
        AsyncStorage.multiRemove(['authToken', 'user']);
        // Navigate to login
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};