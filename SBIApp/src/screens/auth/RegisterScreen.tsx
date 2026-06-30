// RegisterScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthenticationContext';
import { SecureInput } from '../../components/common/SecureInput';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { UserRole } from '../../types';
import { showToast } from '../../components/Toast';

export const RegisterScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('sme');
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isConfirmValid, setIsConfirmValid] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { register } = useAuth();

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRegister = async () => {
    if (!fullName || !isEmailValid || !isPasswordValid || !isConfirmValid) {
      showToast('Please fill in all fields correctly', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (role === 'sme' && !businessName) {
      showToast('Please enter your business name', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await register({ email, password, fullName, role, businessName });
      showToast('Registration successful!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const checkConfirmPassword = (text: string) => {
    setConfirmPassword(text);
    setIsConfirmValid(text === password && text.length > 0);
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
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitle}>Join our community of entrepreneurs</Text>
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
              label="Full Name" 
              placeholder="Enter your full name" 
              value={fullName} 
              onChangeText={setFullName} 
            />
            
            <SecureInput 
              label="Email" 
              placeholder="Enter your email" 
              validationType="email" 
              value={email} 
              onChangeText={setEmail} 
              onValidChange={(valid, val) => { setIsEmailValid(valid); setEmail(val); }} 
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
            
            <SecureInput 
              label="Password" 
              placeholder="Create a password" 
              validationType="password" 
              value={password} 
              onChangeText={setPassword} 
              onValidChange={(valid, val) => { 
                setIsPasswordValid(valid); 
                setPassword(val); 
                if (confirmPassword) setIsConfirmValid(val === confirmPassword); 
              }} 
              secureTextEntry 
            />
            
            <SecureInput 
              label="Confirm Password" 
              placeholder="Confirm your password" 
              value={confirmPassword} 
              onChangeText={checkConfirmPassword} 
              secureTextEntry 
            />

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={isLoading}>
              <LinearGradient 
                colors={['#6366f1', '#4f46e5']} 
                style={styles.gradientButton}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1, padding: SPACING.xl },
  header: { alignItems: 'center', marginTop: SPACING.xxl, marginBottom: SPACING.xxl },
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
  registerButton: { marginTop: SPACING.lg, marginBottom: SPACING.xl },
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
  registerButtonText: { 
    color: COLORS.white, 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold' 
  },
  loginContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxxl,
  },
  loginText: { 
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748b' 
  },
  loginLink: { 
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#6366f1', 
    fontWeight: 'bold' 
  },
});