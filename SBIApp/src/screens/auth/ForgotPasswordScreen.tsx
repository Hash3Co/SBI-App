import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SecureInput } from '../../components/common/SecureInput';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { showToast } from '../../components/Toast';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!isEmailValid) {
      showToast('Please enter a valid email', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Reset Email Sent', `Instructions sent to ${email}. Check your inbox.`);
      navigation.goBack();
    } catch (error) {
      showToast('Failed to send reset email', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <View style={styles.header}><Text style={styles.title}>Reset Password</Text><Text style={styles.subtitle}>Enter your email to receive reset instructions</Text></View>
        <SecureInput label="Email" placeholder="Enter your email" validationType="email" value={email} onChangeText={setEmail} onValidChange={(valid, val) => { setIsEmailValid(valid); setEmail(val); }} keyboardType="email-address" />
        <TouchableOpacity style={styles.resetButton} onPress={handleReset} disabled={isLoading || !isEmailValid}>
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={[styles.gradientButton, (!isEmailValid || isLoading) && styles.gradientDisabled]}>
            <Text style={styles.resetButtonText}>{isLoading ? 'Sending...' : 'Send Reset Email'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, padding: SPACING.xl },
  backButton: { marginBottom: SPACING.lg },
  backText: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.primary },
  header: { alignItems: 'center', marginBottom: SPACING.xxxl },
  title: { fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: 'bold', color: COLORS.gray900, marginBottom: SPACING.sm },
  subtitle: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.gray600, textAlign: 'center' },
  resetButton: { marginTop: SPACING.xl },
  gradientButton: { paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg, alignItems: 'center' },
  gradientDisabled: { opacity: 0.5 },
  resetButtonText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.md, fontWeight: 'bold' },
});