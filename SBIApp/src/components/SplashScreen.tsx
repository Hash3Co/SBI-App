// src/components/SplashScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Platform,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { APP_CONFIG } from '../config/appConfig';

const { width, height } = Dimensions.get('window');

export const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Animate logo first
    Animated.parallel([
      Animated.timing(logoFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Then animate text after delay
    setTimeout(() => {
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 600);

    // Fade in entire screen
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient
      colors={['#1B2A4A', '#2A3F6A', '#0F1A2E']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1B2A4A" />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoFadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo-name.jpg')}
              style={styles.logoImage}
              resizeMode="contain"
              onError={() => setImageError(true)}
            />
            {imageError && (
              <View style={styles.logoFallback}>
                <LinearGradient
                  colors={['#D4A843', '#E8C96A']}
                  style={styles.logoGradient}
                >
                  <Text style={styles.logoFallbackText}>NEXUS4IR</Text>
                </LinearGradient>
              </View>
            )}
            {/* Glow effect */}
            <LinearGradient
              colors={['rgba(212, 168, 67, 0.15)', 'transparent']}
              style={styles.logoGlow}
              pointerEvents="none"
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: textFadeAnim }]}>
          <Text style={styles.brandName}>NEXUS4IR</Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>{APP_CONFIG.brand.tagline}</Text>
          <ActivityIndicator size="large" color={COLORS.accent} style={styles.loader} />
        </Animated.View>
      </View>

      {/* Bottom gradient for depth */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.2)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    flex: 1,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxxl,
  },
  logoContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoImage: {
    width: 180,
    height: 180,
    borderRadius: 36,
    ...Platform.select({
      ios: {
        shadowColor: '#D4A843',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  logoGlow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    top: -35,
    left: -35,
  },
  logoFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGradient: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: 16,
  },
  logoFallbackText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 2,
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  brandName: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 3,
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.accent,
    alignSelf: 'center',
    marginVertical: SPACING.md,
  },
  tagline: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: SPACING.xl,
  },
  loader: {
    marginTop: SPACING.md,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.15,
  },
});