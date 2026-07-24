import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, TextInputProps } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';

interface SecureInputProps extends TextInputProps {
  label: string;
  secureTextEntry?: boolean;
  validationType?: 'email' | 'password';
  onValidChange?: (isValid: boolean, value: string) => void;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const SecureInput: React.FC<SecureInputProps> = ({ label, secureTextEntry, validationType, onValidChange, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTextChange = (text: string) => {
    if (props.onChangeText) {
      props.onChangeText(text);
    }
    
    if (validationType && onValidChange) {
      let isValid = false;
      if (validationType === 'email') {
        isValid = validateEmail(text);
      } else if (validationType === 'password') {
        isValid = validatePassword(text);
      }
      onValidChange(isValid, text);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          {...props}
          onChangeText={handleTextChange}
          style={styles.input}
          secureTextEntry={secureTextEntry && !showPassword}
          placeholderTextColor={COLORS.gray400}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Icon name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={COLORS.gray500} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  label: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '500', color: COLORS.gray700, marginBottom: SPACING.xs },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.gray200, paddingHorizontal: SPACING.md },
  input: { flex: 1, paddingVertical: SPACING.md, fontSize: TYPOGRAPHY.sizes.md, color: COLORS.gray900 },
  eyeIcon: { padding: SPACING.sm },
});