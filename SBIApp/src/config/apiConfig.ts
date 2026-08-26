// src/config/apiConfig.ts
import { Platform } from 'react-native';
import { APP_CONFIG } from './appConfig';

const RENDER_BACKEND_URL = 'https://sbi-app.onrender.com';
const USE_RENDER = true;

export const API_CONFIG = {
  baseURL: USE_RENDER 
    ? `${RENDER_BACKEND_URL}/api`
    : 'http://localhost:8000/api',
  
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