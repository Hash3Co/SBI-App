import { Platform } from 'react-native';


export const COLORS = {
  // Primary Brand Colors - Deep Navy/Blue
  primary: '#1B2A4A',
  primaryLight: '#2A3F6A',
  primaryDark: '#0F1A2E',
  primarySurface: '#E8EDF4',
  
  // Secondary Accent - Clean White/Silver
  secondary: '#FFFFFF',
  secondaryLight: '#F8F9FB',
  secondaryDark: '#E2E8F0',
  
  // Accent - Gold/Amber
  accent: '#D4A843',
  accentLight: '#E8C96A',
  accentDark: '#B8922A',
  
  // Semantic Colors
  success: '#2E8B57',
  successLight: '#E8F5EE',
  error: '#C0392B',
  errorLight: '#FDF0ED',
  warning: '#D4A02B',
  warningLight: '#FCF5E8',
  info: '#3B7A9E',
  infoLight: '#EEF4F8',
  
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F8F9FA',
  gray100: '#F1F3F5',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#868E96',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
  
  // Backgrounds
  background: '#F5F7FA',
  backgroundSecondary: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text
  textPrimary: '#1B2A4A',
  textSecondary: '#495057',
  textTertiary: '#868E96',
  textInverse: '#FFFFFF',
  
  // Borders
  border: '#E9ECEF',
  borderLight: '#F1F3F5',
  
  // Shadows
  shadow: '#1B2A4A',
  shadowLight: 'rgba(27, 42, 74, 0.04)',
  shadowMedium: 'rgba(27, 42, 74, 0.08)',
};

// Light Theme
export const lightThemeColors = {
  primary: '#1B2A4A',
  primaryLight: '#2A3F6A',
  primaryDark: '#0F1A2E',
  primarySurface: '#E8EDF4',
  background: '#F5F7FA',
  card: '#FFFFFF',
  text: '#1B2A4A',
  textSecondary: '#495057',
  textTertiary: '#868E96',
  border: '#E9ECEF',
  accent: '#D4A843',
  success: '#2E8B57',
  error: '#C0392B',
  warning: '#D4A02B',
  info: '#3B7A9E',
};

// Dark Theme
export const darkThemeColors = {
  primary: '#2A3F6A',
  primaryLight: '#3A558A',
  primaryDark: '#1B2A4A',
  primarySurface: '#1A2A40',
  background: '#0F1A2E',
  card: '#1B2A4A',
  text: '#FFFFFF',
  textSecondary: '#B0C4DE',
  textTertiary: '#8A9BB5',
  border: '#2A3F6A',
  accent: '#D4A843',
  success: '#3AA06A',
  error: '#D94A3A',
  warning: '#E0B030',
  info: '#4A8AB0',
};

export type ThemeColors = typeof lightThemeColors;

// Typography
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

// Spacing
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

// Border Radius
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  round: 999,
};

// Shadows
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