// SettingsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthenticationContext';
import { useTheme } from '../../context/ThemeContext';
import { showToast } from '../../components/Toast';

export const SettingsScreen = ({ navigation }: any) => {
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            await logout();
            showToast('Logged out successfully', 'success');
          }
        },
      ],
      { cancelable: true }
    );
  };

  const settingsSections = [
    { 
      title: 'Preferences', 
      icon: 'tune',
      items: [
        { icon: 'dark-mode', label: 'Dark Mode', type: 'switch', value: isDark, onValueChange: toggleTheme },
        { icon: 'notifications', label: 'Push Notifications', type: 'switch', value: notifications, onValueChange: setNotifications },
        { icon: 'fingerprint', label: 'Biometric Login', type: 'switch', value: biometric, onValueChange: setBiometric },
      ]
    },
    { 
      title: 'Account', 
      icon: 'person',
      items: [
        { icon: 'person', label: 'Profile Information', type: 'link', onPress: () => navigation.navigate(user?.role === 'sme' ? 'SMEProfile' : 'InvestorProfile') },
        { icon: 'credit-card', label: 'Payment Methods', type: 'link', onPress: () => navigation.navigate('PaymentMethod') },
        { icon: 'history', label: 'Transaction History', type: 'link', onPress: () => navigation.navigate('PaymentHistory') },
        { icon: 'subscriptions', label: 'Subscription', type: 'link', onPress: () => navigation.navigate('Subscription') },
      ]
    },
    { 
      title: 'Support', 
      icon: 'help',
      items: [
        { icon: 'help', label: 'Help Center', type: 'link', onPress: () => {} },
        { icon: 'privacy-tip', label: 'Privacy Policy', type: 'link', onPress: () => {} },
        { icon: 'description', label: 'Terms of Service', type: 'link', onPress: () => {} },
        { icon: 'mail', label: 'Contact Support', type: 'link', onPress: () => {} },
      ]
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient 
        colors={['#6366f1', '#4f46e5', '#4338ca']} 
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity style={styles.headerAction}>
            <Icon name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.profileSection}>
          <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.avatarGradient}>
            <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'U'}</Text>
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'SME'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <Icon name="edit" size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {settingsSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name={section.icon} size={18} color="#94a3b8" />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[
                    styles.settingItem, 
                    idx === section.items.length - 1 && styles.lastItem
                  ]} 
                  onPress={item.type === 'link' ? item.onPress : undefined}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: '#6366f1' + '10' }]}>
                      <Icon name={item.icon} size={20} color="#6366f1" />
                    </View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  {item.type === 'switch' ? (
                    <Switch 
                      value={item.value} 
                      onValueChange={item.onValueChange} 
                      trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
                      thumbColor={COLORS.white}
                    />
                  ) : (
                    <Icon name="chevron-right" size={20} color="#cbd5e1" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.logoutGradient}>
            <Icon name="logout" size={20} color={COLORS.white} />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 SBI App</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxl,
    borderBottomLeftRadius: BORDER_RADIUS.xxl,
    borderBottomRightRadius: BORDER_RADIUS.xxl,
  },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  backButton: { padding: SPACING.sm },
  headerTitle: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  headerAction: { padding: SPACING.sm },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  profileSection: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginTop: -SPACING.xxxl,
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  avatarGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  profileInfo: { flex: 1 },
  userName: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  userEmail: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#94a3b8',
    marginTop: 2,
  },
  roleBadge: {
    marginTop: 4,
    backgroundColor: '#6366f1' + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 10,
    color: '#6366f1',
    fontWeight: '600',
  },
  editProfileButton: {
    padding: SPACING.sm,
  },
  section: { marginBottom: SPACING.lg },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    paddingHorizontal: 4,
  },
  sectionTitle: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    fontWeight: '600', 
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: { 
    backgroundColor: COLORS.white, 
    borderRadius: BORDER_RADIUS.lg, 
    overflow: 'hidden', 
    ...SHADOWS.sm 
  },
  settingItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: SPACING.md, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  lastItem: { borderBottomWidth: 0 },
  settingLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.md 
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: '#1e293b',
    fontWeight: '500',
  },
  logoutButton: { 
    marginTop: SPACING.md, 
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  logoutGradient: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: SPACING.sm, 
    paddingVertical: SPACING.md, 
    borderRadius: BORDER_RADIUS.lg 
  },
  logoutText: { 
    color: COLORS.white, 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold' 
  },
  footer: {
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.md,
  },
  versionText: { 
    fontSize: TYPOGRAPHY.sizes.xs, 
    color: '#94a3b8' 
  },
  copyrightText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#cbd5e1',
  },
});