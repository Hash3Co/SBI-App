// src/components/common/PasswordInput.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { SecurityUtils, PasswordValidationResult } from '../../utils/securityUtils';

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  showStrength?: boolean;
  showSuggestions?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder = 'Enter password',
  showStrength = true,
  showSuggestions = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState<PasswordValidationResult | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const handleTextChange = (text: string) => {
    onChangeText(text);
    const result = SecurityUtils.validatePassword(text);
    setValidation(result);

    Animated.timing(fadeAnim, {
      toValue: result.valid || text.length === 0 ? 1 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const getStrengthColor = () => {
    if (!validation || !value) return COLORS.gray300;
    switch (validation.strength) {
      case 'very-strong': return '#10b981';
      case 'strong': return '#3b82f6';
      case 'medium': return '#f59e0b';
      case 'weak': return '#ef4444';
      default: return COLORS.gray300;
    }
  };

  const getStrengthLabel = () => {
    if (!validation || !value) return 'No password';
    switch (validation.strength) {
      case 'very-strong': return 'Very Strong';
      case 'strong': return 'Strong';
      case 'medium': return 'Medium';
      case 'weak': return 'Weak';
      default: return 'No password';
    }
  };

  const getStrengthPercentage = () => {
    if (!validation || !value) return 0;
    return (validation.score / 8) * 100;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray400}
          value={value}
          onChangeText={handleTextChange}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Icon name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={COLORS.gray500} />
        </TouchableOpacity>
      </View>

      {showStrength && value.length > 0 && (
        <Animated.View style={[styles.strengthContainer, { opacity: fadeAnim }]}>
          <View style={styles.strengthBar}>
            <View
              style={[
                styles.strengthFill,
                {
                  width: `${getStrengthPercentage()}%`,
                  backgroundColor: getStrengthColor(),
                },
              ]}
            />
          </View>
          <View style={styles.strengthInfo}>
            <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
              {getStrengthLabel()}
            </Text>
            {validation && (
              <Text style={styles.strengthScore}>
                {validation.score}/8
              </Text>
            )}
          </View>
        </Animated.View>
      )}

      {showSuggestions && validation && !validation.valid && value.length > 0 && (
        <Animated.View style={[styles.suggestionsContainer, { opacity: fadeAnim }]}>
          <Text style={styles.suggestionsTitle}>Password Suggestions:</Text>
          {validation.suggestions.map((suggestion: string, index: number) => (
            <View key={index} style={styles.suggestionItem}>
              <Icon name="check-circle" size={14} color={COLORS.warning} />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))}
        </Animated.View>
      )}

      {showSuggestions && validation && validation.valid && value.length > 0 && (
        <Animated.View style={[styles.validContainer, { opacity: fadeAnim }]}>
          <Icon name="check-circle" size={16} color={COLORS.success} />
          <Text style={styles.validText}>Password meets all requirements!</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray900,
  },
  eyeIcon: {
    padding: SPACING.sm,
  },
  strengthContainer: {
    marginTop: SPACING.sm,
  },
  strengthBar: {
    height: 4,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.round,
  },
  strengthInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  strengthText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
  },
  strengthScore: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
  },
  suggestionsContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.warningLight,
    borderRadius: BORDER_RADIUS.md,
  },
  suggestionsTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: COLORS.warning,
    marginBottom: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: 2,
  },
  suggestionText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray700,
  },
  validContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.successLight,
    borderRadius: BORDER_RADIUS.md,
  },
  validText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.success,
    fontWeight: '500',
  },
});