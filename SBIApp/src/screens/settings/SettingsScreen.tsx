// src/screens/shared/SettingsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthenticationContext';
import { useTheme } from '../../context/ThemeContext';
import { APP_CONFIG } from '../../config/appConfig';

export const SettingsScreen = ({ navigation }: any) => {
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          });
        }},
      ],
      { cancelable: true }
    );
  };

  type SwitchSetting = {
    icon: string;
    label: string;
    type: 'switch';
    value: boolean;
    onValueChange: (value: boolean) => void;
  };

  type LinkSetting = {
    icon: string;
    label: string;
    type: 'link';
    onPress: () => void;
  };

  type SettingsSection = {
    title: string;
    icon: string;
    items: (SwitchSetting | LinkSetting)[];
  };

  const settingsSections: SettingsSection[] = [
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
      <LinearGradient colors={['#1B2A4A', '#2A3F6A', '#3A558A']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.profileSection}>
          <LinearGradient colors={['#1B2A4A', '#2A3F6A']} style={styles.avatarGradient}>
            <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'U'}</Text>
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'SME'}</Text>
            </View>
          </View>
        </View>

        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name={section.icon} size={18} color="#94a3b8" />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <TouchableOpacity key={idx} style={[styles.settingItem, idx === section.items.length - 1 && styles.lastItem]} onPress={item.type === 'link' ? item.onPress : undefined} activeOpacity={0.7}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: '#1B2A4A' + '10' }]}>
                      <Icon name={item.icon} size={20} color="#1B2A4A" />
                    </View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  {item.type === 'switch' ? (
                    <Switch value={item.value} onValueChange={item.onValueChange} trackColor={{ false: '#e2e8f0', true: '#1B2A4A' }} thumbColor={COLORS.white} />
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
          <Text style={styles.versionText}>Version {APP_CONFIG.version}</Text>
          <Text style={styles.copyrightText}>© 2024 NEXUS4IR</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxxl, paddingBottom: SPACING.xxl, borderBottomLeftRadius: BORDER_RADIUS.xxl, borderBottomRightRadius: BORDER_RADIUS.xxl },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { padding: SPACING.sm },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: 'bold', color: COLORS.white },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  profileSection: { flexDirection: 'row', alignItems: 'center', marginTop: -SPACING.xxxl, marginBottom: SPACING.xl, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, ...SHADOWS.md },
  avatarGradient: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: COLORS.white },
  profileInfo: { flex: 1 },
  userName: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: 'bold', color: '#1B2A4A' },
  userEmail: { fontSize: TYPOGRAPHY.sizes.sm, color: '#94a3b8', marginTop: 2 },
  roleBadge: { marginTop: 4, backgroundColor: '#1B2A4A' + '15', paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.round, alignSelf: 'flex-start' },
  roleText: { fontSize: 10, color: '#1B2A4A', fontWeight: '600' },
  section: { marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm, paddingHorizontal: 4 },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', ...SHADOWS.sm },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  lastItem: { borderBottomWidth: 0 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  settingIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: TYPOGRAPHY.sizes.md, color: '#1B2A4A', fontWeight: '500' },
  logoutButton: { marginTop: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.md },
  logoutGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg },
  logoutText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.md, fontWeight: 'bold' },
  footer: { alignItems: 'center', gap: 4, marginTop: SPACING.md },
  versionText: { fontSize: TYPOGRAPHY.sizes.xs, color: '#94a3b8' },
  copyrightText: { fontSize: TYPOGRAPHY.sizes.xs, color: '#cbd5e1' },
});