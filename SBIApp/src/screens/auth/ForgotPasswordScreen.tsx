// src/screens/auth/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SecureInput } from '../../components/common/SecureInput';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { authService } from '../../services';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Please enter your email');
      return;
    }
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      Alert.alert('Password reset instructions sent to your email');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email to receive reset instructions</Text>
        </View>
        <SecureInput label="Email" placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TouchableOpacity style={styles.resetButton} onPress={handleReset} disabled={isLoading}>
          <LinearGradient colors={['#1B2A4A', '#2A3F6A']} style={[styles.gradientButton, isLoading && styles.gradientDisabled]}>
            <Text style={styles.resetButtonText}>{isLoading ? 'Sending...' : 'Send Reset Email'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollContent: { flexGrow: 1, padding: SPACING.xl },
  backButton: { marginBottom: SPACING.lg },
  backText: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.primary },
  header: { alignItems: 'center', marginBottom: SPACING.xxxl },
  title: { fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: 'bold', color: COLORS.gray900, marginBottom: SPACING.sm },
  subtitle: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.gray600, textAlign: 'center' },
  resetButton: { marginTop: SPACING.xl },
  gradientButton: { paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', ...SHADOWS.md },
  gradientDisabled: { opacity: 0.5 },
  resetButtonText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.md, fontWeight: 'bold' },
});