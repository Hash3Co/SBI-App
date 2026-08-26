// src/config/apiConfig.ts
import { Platform } from 'react-native';
import { APP_CONFIG } from './appConfig';

// ============================================================
// YOUR RENDER BACKEND URL
// ============================================================
const RENDER_BACKEND_URL = 'https://sbi-app.onrender.com';
// ============================================================

// For local development
const getLocalIP = () => {
  if (Platform.OS === 'android') return '10.0.2.2';
  if (Platform.OS === 'ios') return '127.0.0.1';
  return '192.168.1.100';
};

// Set to true for production, false for local development
const USE_RENDER = true;

export const API_CONFIG = {
  baseURL: USE_RENDER 
    ? `${RENDER_BACKEND_URL}/api`
    : `http://${getLocalIP()}:8000/api`,
  
  timeout: 30000,
  retryCount: 3,
  retryDelay: 1000,
  
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Platform': Platform.OS,
    'X-App-Version': APP_CONFIG.version,
    'X-App-Name': APP_CONFIG.name,
  },
};

console.log(`🔗 API Base URL: ${API_CONFIG.baseURL}`);
console.log(`🌐 Using Render: ${USE_RENDER}`);