// src/utils/securityUtils.ts
import { getUniqueId, getVersion, getSystemName } from 'react-native-device-info';
import 'react-native-get-random-values';

export interface PasswordValidationResult {
  valid: boolean;
  message: string;
  suggestions: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
}

export class SecurityUtils {
  static async getDeviceFingerprint(): Promise<string> {
    const deviceId = await getUniqueId();
    const appVersion = getVersion();
    const os = getSystemName();
    return `${deviceId}-${appVersion}-${os}`;
  }

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

  static validateEmail(email: string): boolean {
    if (!email) return false;
    const sanitized = this.sanitizeInput(email);
    return sanitized.length <= 255 &&
      !sanitized.includes('..') &&
      !sanitized.includes('@.') &&
      sanitized.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) !== null;
  }

  static validatePassword(password: string): PasswordValidationResult {
    const suggestions: string[] = [];
    let score = 0;
    const checks = {
      length: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommon: !this.isCommonPassword(password),
      noSequential: !this.hasSequentialCharacters(password),
      noRepeating: !this.hasRepeatingCharacters(password),
    };

    if (!password) {
      return {
        valid: false,
        message: 'Password is required',
        suggestions: [
          '• Use at least 8 characters',
          '• Include uppercase and lowercase letters',
          '• Add at least one number',
          '• Include a special character (!@#$%^&*)',
        ],
        strength: 'weak',
        score: 0,
      };
    }

    // Calculate score
    if (checks.length) score += 1;
    if (checks.hasUppercase) score += 1;
    if (checks.hasLowercase) score += 1;
    if (checks.hasNumber) score += 1;
    if (checks.hasSpecial) score += 1;
    if (checks.noCommon) score += 1;
    if (checks.noSequential) score += 1;
    if (checks.noRepeating) score += 1;

    // Build suggestions
    if (!checks.length) {
      suggestions.push('• Use at least 8 characters (current: ' + password.length + ')');
    }
    if (!checks.hasUppercase) {
      suggestions.push('• Add an uppercase letter (A-Z)');
    }
    if (!checks.hasLowercase) {
      suggestions.push('• Add a lowercase letter (a-z)');
    }
    if (!checks.hasNumber) {
      suggestions.push('• Add a number (0-9)');
    }
    if (!checks.hasSpecial) {
      suggestions.push('• Add a special character (!@#$%^&*())');
    }
    if (checks.noCommon === false) {
      suggestions.push('• Avoid common passwords like "password123"');
    }
    if (checks.noSequential === false) {
      suggestions.push('• Avoid sequential characters like "1234" or "abcd"');
    }
    if (checks.noRepeating === false) {
      suggestions.push('• Avoid repeating characters like "aaaa"');
    }

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
    let valid = false;

    if (score >= 8) {
      strength = 'very-strong';
      valid = true;
    } else if (score >= 6) {
      strength = 'strong';
      valid = true;
    } else if (score >= 4) {
      strength = 'medium';
      valid = true;
    } else {
      strength = 'weak';
      valid = false;
    }

    // Minimum requirements for valid password
    const minimumValid = checks.length &&
      checks.hasUppercase &&
      checks.hasLowercase &&
      checks.hasNumber &&
      checks.hasSpecial;

    return {
      valid: minimumValid,
      message: minimumValid ? 'Password is strong' : 'Password needs improvement',
      suggestions,
      strength,
      score,
    };
  }

  private static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', 'qwerty', 'admin', 'letmein',
      'welcome', 'monkey', 'dragon', 'master', 'hello',
      'freedom', 'whatever', 'trustno1', '123456789',
      'password123', 'qwerty123', 'admin123',
    ];
    return commonPasswords.some(p => password.toLowerCase().includes(p));
  }

  private static hasSequentialCharacters(password: string): boolean {
    const sequences = ['123', '234', '345', '456', '567', '678', '789', '890',
      'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij',
      'qwerty', 'asdfgh', 'zxcvbn'];
    return sequences.some(seq => password.toLowerCase().includes(seq));
  }

  private static hasRepeatingCharacters(password: string): boolean {
    return /(.)\1{2,}/.test(password);
  }

  static validateAmount(amount: number, maxAmount: number = 1000000000): boolean {
    if (isNaN(amount)) return false;
    if (amount <= 0) return false;
    if (amount > maxAmount) return false;
    if (amount.toString().includes('e')) return false;
    if (amount.toString().split('.')[1]?.length > 2) return false;
    return true;
  }

  static validatePhone(phone: string): boolean {
    if (!phone) return false;
    const clean = phone.replace(/\s/g, '');
    const lesothoRegex = /^(\+266|0)[0-9]{8}$/;
    const saRegex = /^(\+27|0)[0-9]{9}$/;
    return lesothoRegex.test(clean) || saRegex.test(clean);
  }

  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    (globalThis as any).crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static async hashData(data: string): Promise<string> {
    // TextEncoder is not available in all React Native runtimes.
    const encoded = unescape(encodeURIComponent(data));
    const dataBytes = new Uint8Array(encoded.length);
    for (let index = 0; index < encoded.length; index++) {
      dataBytes[index] = encoded.charCodeAt(index);
    }
    const hashBuffer = await (globalThis as any).crypto.subtle.digest('SHA-256', dataBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

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
}