import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', loading = false, disabled = false, fullWidth = false }) => {
  const getGradient = () => {
    switch(variant) {
      case 'primary': return [COLORS.primary, COLORS.primaryDark];
      case 'success': return [COLORS.success, COLORS.success];
      case 'error': return [COLORS.error, COLORS.error];
      default: return [COLORS.gray400, COLORS.gray500];
    }
  };

  return (
    <TouchableOpacity style={[styles.button, fullWidth && styles.fullWidth]} onPress={onPress} disabled={disabled || loading}>
      <LinearGradient colors={getGradient()} style={[styles.gradient, disabled && styles.disabled]}>
        {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.text}>{title}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
  fullWidth: { width: '100%' },
  gradient: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.5 },
  text: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.md, fontWeight: 'bold' },
});