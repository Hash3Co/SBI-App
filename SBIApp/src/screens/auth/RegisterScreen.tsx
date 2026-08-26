// src/screens/auth/RegisterScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Image,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthenticationContext';
import { SecureInput } from '../../components/common/SecureInput';
import { PasswordInput } from '../../components/common/PasswordInput';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { UserRole } from '../../types';
import { SecurityUtils } from '../../utils/securityUtils';

export const RegisterScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('sme');
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [imageError, setImageError] = useState(false);
  const { register } = useAuth();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const result = SecurityUtils.validatePassword(text);
    setIsPasswordValid(result.valid);
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    if (!isPasswordValid) {
      Alert.alert('Please use a stronger password');
      return;
    }
    if (role === 'sme' && !businessName) {
      Alert.alert('Please enter your business name');
      return;
    }
    setIsLoading(true);
    try {
      await register({ email, password, fullName, role, businessName });
    } catch (error: any) {
      Alert.alert(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/logo.jpg')}
                style={styles.logoImage}
                resizeMode="contain"
                onError={() => setImageError(true)}
              />
              {imageError && (
                <LinearGradient colors={['#1B2A4A', '#2A3F6A']} style={styles.logoFallback}>
                  <Text style={styles.logoFallbackText}>NEXUS4IR</Text>
                </LinearGradient>
              )}
            </View>
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitle}>Join our community of entrepreneurs</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[styles.roleButton, role === 'sme' && styles.roleButtonActive]}
                onPress={() => setRole('sme')}
              >
                <Icon name="business" size={20} color={role === 'sme' ? COLORS.primary : COLORS.gray400} />
                <Text style={[styles.roleText, role === 'sme' && styles.roleTextActive]}>SME</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, role === 'investor' && styles.roleButtonActive]}
                onPress={() => setRole('investor')}
              >
                <Icon name="account-balance-wallet" size={20} color={role === 'investor' ? COLORS.primary : COLORS.gray400} />
                <Text style={[styles.roleText, role === 'investor' && styles.roleTextActive]}>Investor</Text>
              </TouchableOpacity>
            </View>

            <SecureInput
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
            />

            <SecureInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            {role === 'sme' && (
              <SecureInput
                label="Business Name"
                placeholder="Enter your business name"
                value={businessName}
                onChangeText={setBusinessName}
              />
            )}

            <PasswordInput
              label="Password"
              placeholder="Create a strong password"
              value={password}
              onChangeText={handlePasswordChange}
              showStrength={true}
              showSuggestions={true}
            />

            <SecureInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Password Requirements:</Text>
              <View style={styles.requirementItem}>
                <Icon
                  name={password.length >= 8 ? 'check-circle' : 'circle'}
                  size={16}
                  color={password.length >= 8 ? COLORS.success : COLORS.gray400}
                />
                <Text style={[styles.requirementText, password.length >= 8 && styles.requirementMet]}>
                  At least 8 characters
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon
                  name={/[A-Z]/.test(password) ? 'check-circle' : 'circle'}
                  size={16}
                  color={/[A-Z]/.test(password) ? COLORS.success : COLORS.gray400}
                />
                <Text style={[styles.requirementText, /[A-Z]/.test(password) && styles.requirementMet]}>
                  Uppercase letter (A-Z)
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon
                  name={/[a-z]/.test(password) ? 'check-circle' : 'circle'}
                  size={16}
                  color={/[a-z]/.test(password) ? COLORS.success : COLORS.gray400}
                />
                <Text style={[styles.requirementText, /[a-z]/.test(password) && styles.requirementMet]}>
                  Lowercase letter (a-z)
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon
                  name={/[0-9]/.test(password) ? 'check-circle' : 'circle'}
                  size={16}
                  color={/[0-9]/.test(password) ? COLORS.success : COLORS.gray400}
                />
                <Text style={[styles.requirementText, /[0-9]/.test(password) && styles.requirementMet]}>
                  Number (0-9)
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon
                  name={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'check-circle' : 'circle'}
                  size={16}
                  color={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? COLORS.success : COLORS.gray400}
                />
                <Text style={[styles.requirementText, /[!@#$%^&*(),.?":{}|<>]/.test(password) && styles.requirementMet]}>
                  Special character (!@#$%^&*)
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={isLoading}>
              <LinearGradient colors={['#1B2A4A', '#2A3F6A']} style={styles.gradientButton}>
                <Text style={styles.registerButtonText}>{isLoading ? 'Creating Account...' : 'Sign Up'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollContent: { flexGrow: 1, padding: SPACING.xl },
  header: { alignItems: 'center', marginTop: SPACING.xxl, marginBottom: SPACING.xxl },
  logoContainer: {
    width: 100,
    height: 100,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#1B2A4A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  logoFallback: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  logoFallbackText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: 'bold',
    color: '#1B2A4A',
    marginTop: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray600,
    marginTop: SPACING.xs,
  },
  form: { flex: 1 },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.xl,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  roleButtonActive: {
    backgroundColor: COLORS.white,
    ...SHADOWS.xs,
  },
  roleText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray400,
    fontWeight: '500',
  },
  roleTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  registerButton: { marginTop: SPACING.lg, marginBottom: SPACING.xl },
  gradientButton: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxxl,
  },
  loginText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray600,
  },
  loginLink: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  passwordRequirements: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  requirementsTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 2,
  },
  requirementText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
  },
  requirementMet: {
    color: COLORS.success,
    fontWeight: '500',
  },
});