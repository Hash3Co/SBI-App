// src/config/apiConfig.ts
import { Platform } from 'react-native';

// Determine if we're in development
const isDevelopment = __DEV__;

// For iOS simulator, use localhost; for Android emulator, use 10.0.2.2
// For physical device, use your computer's local IP
const getLocalIP = () => {
  // Use your computer's local IP address
  return '192.168.43.224'; // Your machine IP
};

export const API_CONFIG = {
  // Base URL configuration
  baseURL: isDevelopment 
    ? `http://${getLocalIP()}:8000/api`  // Local development
    : 'https://sbi-app.onrender.com/api', // Production
  
  // Alternative if you want to use a different port
  // For example, if backend runs on port 8000
  timeout: 30000,
  retryCount: 3,
  retryDelay: 1000,
  
  // Additional config
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

// For debugging
console.log(`API Base URL: ${API_CONFIG.baseURL}`);