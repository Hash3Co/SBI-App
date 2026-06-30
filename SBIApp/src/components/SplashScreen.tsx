import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export const SplashScreen = () => (
  <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.container}>
    <View style={styles.content}>
      <Text style={styles.logoText}>SBI</Text>
      <Text style={styles.logoSubtitle}>App</Text>
      <Text style={styles.tagline}>Connecting SMEs with Investors</Text>
      <ActivityIndicator size="large" color={COLORS.white} style={styles.loader} />
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center' },
  logoText: { fontSize: TYPOGRAPHY.sizes.huge, fontWeight: 'bold', color: COLORS.white, letterSpacing: 2 },
  logoSubtitle: { fontSize: TYPOGRAPHY.sizes.xxl, color: COLORS.white, marginLeft: SPACING.xs },
  tagline: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.white, opacity: 0.9, marginTop: SPACING.sm },
  loader: { marginTop: SPACING.xxxl },
});