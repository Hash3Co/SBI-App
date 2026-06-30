import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { Button } from './common/Button';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message, icon = 'inbox', buttonText, onButtonPress }) => {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={64} color={COLORS.gray300} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {buttonText && onButtonPress && <Button title={buttonText} onPress={onButtonPress} variant="primary" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: SPACING.xxxl },
  title: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: 'bold', color: COLORS.gray700, marginTop: SPACING.lg },
  message: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.gray500, textAlign: 'center', marginTop: SPACING.sm, marginBottom: SPACING.xl },
});