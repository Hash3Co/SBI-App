import validator from 'validator';
import { getUniqueId, getVersion, getSystemName } from 'react-native-device-info';
import 'react-native-get-random-values';

export class SecurityUtils {
  // Generate device fingerprint
  static async getDeviceFingerprint(): Promise<string> {
    const deviceId = await getUniqueId();
    const appVersion = getVersion();
    const os = getSystemName();
    return `${deviceId}-${appVersion}-${os}`;
  }

  // Sanitize ALL user inputs
  static sanitizeInput(input: string): string {
    if (!input) return '';
    return input
      .replace(/[<>]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/`/g, '')
      .replace(/\$/g, '')
      .replace(/\\/g, '')
      .trim();
  }

  // Validate email - STRICT
  static validateEmail(email: string): boolean {
    if (!email) return false;
    const sanitized = this.sanitizeInput(email);
    return validator.isEmail(sanitized) && 
           sanitized.length <= 255 &&
           !sanitized.includes('..') &&
           !sanitized.includes('@.') &&
           sanitized.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) !== null;
  }

  // Validate password - STRONG
  static validatePassword(password: string): { valid: boolean; message: string } {
    if (!password) return { valid: false, message: 'Password required' };
    if (password.length < 8) return { valid: false, message: 'Minimum 8 characters' };
    if (!/[A-Z]/.test(password)) return { valid: false, message: 'Need 1 uppercase letter' };
    if (!/[a-z]/.test(password)) return { valid: false, message: 'Need 1 lowercase letter' };
    if (!/[0-9]/.test(password)) return { valid: false, message: 'Need 1 number' };
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return { valid: false, message: 'Need 1 special character' };
    if (password.length > 128) return { valid: false, message: 'Too long' };
    return { valid: true, message: 'OK' };
  }

  // Detect SQL injection attempts
  static hasSQLInjectionPattern(input: string): boolean {
    const patterns = [
      /(\bSELECT\b.*\bFROM\b)/i,
      /(\bINSERT\b.*\bINTO\b)/i,
      /(\bUPDATE\b.*\bSET\b)/i,
      /(\bDELETE\b.*\bFROM\b)/i,
      /(\bDROP\b.*\bTABLE\b)/i,
      /(\bUNION\b.*\bSELECT\b)/i,
      /(\bALTER\b.*\bTABLE\b)/i,
      /(\bCREATE\b.*\bTABLE\b)/i,
      /(--)/, /(;)/, /('.*OR.*'.*=')/i,
      /('.*AND.*'.*=')/i,
      /(\bEXEC\b.*\bXP_\b)/i,
    ];
    return patterns.some(pattern => pattern.test(input));
  }

  // Detect XSS attempts
  static hasXSSPattern(input: string): boolean {
    const patterns = [
      /<script[^>]*>.*<\/script>/i,
      /javascript:/i,
      /onerror\s*=/i,
      /onload\s*=/i,
      /onclick\s*=/i,
      /<iframe[^>]*>/i,
      /<embed[^>]*>/i,
      /<object[^>]*>/i,
      /<img[^>]*onerror/i,
      /eval\(/i,
      /document\.cookie/i,
      /localStorage\./i,
      /sessionStorage\./i,
    ];
    return patterns.some(pattern => pattern.test(input));
  }

  // Validate amount - PREVENT FRAUD
  static validateAmount(amount: number, maxAmount: number = 1000000000): boolean {
    if (isNaN(amount)) return false;
    if (amount <= 0) return false;
    if (amount > maxAmount) return false;
    if (amount.toString().includes('e')) return false;
    if (amount.toString().split('.')[1]?.length > 2) return false;
    return true;
  }

  // Validate phone - Lesotho/South Africa only
  static validatePhone(phone: string): boolean {
    if (!phone) return false;
    const clean = phone.replace(/\s/g, '');
    const lesothoRegex = /^(\+266|0)[0-9]{8}$/;
    const saRegex = /^(\+27|0)[0-9]{9}$/;
    return lesothoRegex.test(clean) || saRegex.test(clean);
  }

  // Generate CSRF token
  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Hash data for verification
  static async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}