// constants/theme.ts
import { Platform } from 'react-native';

// Professional Color Palette - Minimal & Elegant
export const COLORS = {
  // Primary - Sophisticated Navy
  primary: '#1a2332',
  primaryLight: '#2c3e50',
  primaryDark: '#0f1621',
  primarySurface: '#f0f2f5',
  
  // Accent - Refined Gold
  accent: '#c9a84c',
  accentLight: '#dfc87a',
  accentDark: '#a88b3a',
  
  // Semantic Colors - Muted
  success: '#2d8f5e',
  successLight: '#e8f5ef',
  error: '#c0392b',
  errorLight: '#fdf0ed',
  warning: '#d4a02b',
  warningLight: '#fcf5e8',
  info: '#3b7a9e',
  infoLight: '#eef4f8',
  
  // Neutrals - Clean & Professional
  white: '#ffffff',
  black: '#000000',
  gray50: '#f8f9fa',
  gray100: '#f1f3f5',
  gray200: '#e9ecef',
  gray300: '#dee2e6',
  gray400: '#ced4da',
  gray500: '#adb5bd',
  gray600: '#868e96',
  gray700: '#495057',
  gray800: '#343a40',
  gray900: '#212529',
  
  // Backgrounds
  background: '#f8f9fa',
  backgroundSecondary: '#ffffff',
  card: '#ffffff',
  
  // Text
  textPrimary: '#1a2332',
  textSecondary: '#495057',
  textTertiary: '#868e96',
  textInverse: '#ffffff',
  
  // Borders
  border: '#e9ecef',
  borderLight: '#f1f3f5',
  
  // Shadows
  shadow: '#000000',
  shadowLight: 'rgba(0,0,0,0.04)',
  shadowMedium: 'rgba(0,0,0,0.08)',
};

// Typography - Clean & Readable
export const TYPOGRAPHY = {
  fonts: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    semibold: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
  },
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 34,
    massive: 42,
  },
  lineHeights: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 40,
    huge: 48,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Spacing - Consistent
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

// Border Radius - Subtle
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  round: 999,
};

// Shadows - Subtle & Elegant
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
};