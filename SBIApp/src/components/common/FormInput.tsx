import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: string;
}

export const FormInput: React.FC<FormInputProps> = ({ label, error, icon, style, ...props }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {icon && <Icon name={icon} size={20} color={COLORS.gray400} style={styles.icon} />}
        <TextInput style={[styles.input, icon && styles.inputWithIcon, style]} placeholderTextColor={COLORS.gray400} {...props} />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '500', color: COLORS.gray700, marginBottom: SPACING.xs },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray200, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.white },
  inputError: { borderColor: COLORS.error },
  icon: { marginLeft: SPACING.md },
  input: { flex: 1, paddingVertical: SPACING.md, paddingRight: SPACING.md, fontSize: TYPOGRAPHY.sizes.md, color: COLORS.gray900 },
  inputWithIcon: { paddingLeft: SPACING.sm },
  errorText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.error, marginTop: SPACING.xs },
});