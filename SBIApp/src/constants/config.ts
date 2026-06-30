export const APP_CONFIG = {
  name: 'SBI App',
  version: '1.0.0',
  environment: 'production',
  sessionTimeout: 15 * 60 * 1000, // 15 minutes
  maxLoginAttempts: 5,
  lockoutDuration: 30 * 60 * 1000, // 30 minutes
  minPasswordLength: 8,
  requireEmailVerification: true,
  enableBiometric: true,
  supportEmail: 'support@sbiapp.com',
  socialLinks: {
    facebook: 'https://facebook.com/sbiapp',
    twitter: 'https://twitter.com/sbiapp',
    linkedin: 'https://linkedin.com/company/sbiapp',
  },
};