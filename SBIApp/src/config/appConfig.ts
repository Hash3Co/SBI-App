// src/config/appConfig.ts
export const APP_CONFIG = {
  name: 'NEXUS4IR',
  displayName: 'NEXUS4IR',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  maxLoginAttempts: 5,
  lockoutDuration: 30 * 60 * 1000, // 30 minutes
  minPasswordLength: 8,
  requireEmailVerification: true,
  enableBiometric: true,
  supportEmail: 'support@nexus4ir.com',
  website: 'https://nexus4ir.com',
  socialLinks: {
    facebook: 'https://facebook.com/nexus4ir',
    twitter: 'https://twitter.com/nexus4ir',
    linkedin: 'https://linkedin.com/company/nexus4ir',
  },
  brand: {
    tagline: 'CREATING THE ECOSYSTEM THAT WE NEED',
    logoText: 'NEXUS4IR',
  },
};