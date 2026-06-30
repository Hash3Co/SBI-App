// LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthenticationContext';
import { SecureInput } from '../../components/common/SecureInput';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { UserRole } from '../../types';
import { showToast } from '../../components/Toast';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('sme');
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { login } = useAuth();

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Please enter email and password', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password, role);
      showToast('Login successful!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Login failed', 'error');
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
              <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.logoGradient}>
                <Text style={styles.logoText}>SBI</Text>
              </LinearGradient>
            </View>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.roleSelector}>
              <TouchableOpacity 
                style={[styles.roleButton, role === 'sme' && styles.roleButtonActive]} 
                onPress={() => setRole('sme')}
              >
                <Icon name="business" size={20} color={role === 'sme' ? '#6366f1' : '#94a3b8'} />
                <Text style={[styles.roleText, role === 'sme' && styles.roleTextActive]}>SME</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleButton, role === 'investor' && styles.roleButtonActive]} 
                onPress={() => setRole('investor')}
              >
                <Icon name="account-balance-wallet" size={20} color={role === 'investor' ? '#6366f1' : '#94a3b8'} />
                <Text style={[styles.roleText, role === 'investor' && styles.roleTextActive]}>Investor</Text>
              </TouchableOpacity>
            </View>

            <SecureInput 
              label="Email" 
              placeholder="Enter your email" 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
            />
            
            <SecureInput 
              label="Password" 
              placeholder="Enter your password" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
            />

            <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
              <LinearGradient 
                colors={['#6366f1', '#4f46e5']} 
                style={[styles.gradientButton, isLoading && styles.gradientDisabled]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                <Text style={styles.loginButtonText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1, padding: SPACING.xl },
  header: { alignItems: 'center', marginTop: SPACING.xxxl, marginBottom: SPACING.xxl },
  logoContainer: {
    marginBottom: SPACING.lg,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoText: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  welcomeText: { 
    fontSize: TYPOGRAPHY.sizes.xxl, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  subtitle: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: '#64748b',
    marginTop: SPACING.xs,
  },
  form: { flex: 1 },
  roleSelector: { 
    flexDirection: 'row', 
    backgroundColor: '#f1f5f9', 
    borderRadius: BORDER_RADIUS.lg, 
    padding: 4, 
    marginBottom: SPACING.xl 
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
    ...Platform.select({
      ios: { 
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 4 
      },
      android: { elevation: 2 },
    }),
  },
  roleText: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: '#94a3b8', 
    fontWeight: '500' 
  },
  roleTextActive: { 
    color: '#6366f1', 
    fontWeight: 'bold' 
  },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: SPACING.xl },
  forgotPasswordText: { 
    color: '#6366f1', 
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
  loginButton: { marginBottom: SPACING.xl },
  gradientButton: { 
    paddingVertical: SPACING.md, 
    borderRadius: BORDER_RADIUS.lg, 
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  gradientDisabled: { opacity: 0.5 },
  loginButtonText: { 
    color: COLORS.white, 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold' 
  },
  registerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: SPACING.lg 
  },
  registerText: { 
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748b' 
  },
  registerLink: { 
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#6366f1', 
    fontWeight: 'bold' 
  },
});