// src/screens/auth/OnboardingScreen.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { APP_CONFIG } from '../../config/appConfig';

const { width } = Dimensions.get('window');

const onboardingData = [
  { 
    id: '1', 
    title: 'Connect with Investors', 
    description: 'Find the right investors who are interested in your industry and funding needs.', 
    icon: 'people',
    colors: ['#1B2A4A', '#2A3F6A']
  },
  { 
    id: '2', 
    title: 'Get Funding Ready', 
    description: 'Complete training courses and improve your readiness score to attract investors.', 
    icon: 'school',
    colors: ['#2A3F6A', '#3A558A']
  },
  { 
    id: '3', 
    title: 'Secure Your Future', 
    description: 'Get matched, pitch your business, and secure the funding you need to grow.', 
    icon: 'trending-up',
    colors: ['#D4A843', '#E8C96A']
  },
];

export const OnboardingScreen = ({ navigation }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<Animated.FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => navigation.replace('Login');

  const renderItem = ({ item, index }: any) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const scale = scrollX.interpolate({ inputRange, outputRange: [0.8, 1, 0.8], extrapolate: 'clamp' });

    return (
      <View style={styles.slide}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale }] }]}>
          <LinearGradient colors={item.colors} style={styles.iconGradient}>
            <Icon name={item.icon} size={80} color={COLORS.white} />
          </LinearGradient>
        </Animated.View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandHeader}>
        <Text style={styles.brandText}>NEXUS4IR</Text>
        <Text style={styles.brandTagline}>{APP_CONFIG.brand.tagline}</Text>
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        keyExtractor={item => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const scale = scrollX.interpolate({ inputRange, outputRange: [0.8, 1.3, 0.8], extrapolate: 'clamp' });
            const opacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
            return (
              <Animated.View key={index} style={[styles.dot, { opacity, transform: [{ scale }], backgroundColor: index === currentIndex ? '#1B2A4A' : '#DEE2E6' }]} />
            );
          })}
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext}>
            <LinearGradient colors={onboardingData[currentIndex].colors} style={styles.gradientButton}>
              <Text style={styles.nextText}>{currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}</Text>
              <Icon name="arrow-forward" size={20} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  brandHeader: { paddingTop: SPACING.xxxl, alignItems: 'center', backgroundColor: '#1B2A4A', paddingBottom: SPACING.md },
  brandText: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, letterSpacing: 2 },
  brandTagline: { fontSize: 10, color: COLORS.accent, letterSpacing: 1, marginTop: 2 },
  slide: { width, padding: SPACING.xl, alignItems: 'center', justifyContent: 'center', paddingTop: SPACING.lg },
  iconContainer: { marginBottom: SPACING.xxxl },
  iconGradient: { width: 160, height: 160, borderRadius: 80, justifyContent: 'center', alignItems: 'center', ...SHADOWS.lg },
  title: { fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: 'bold', color: '#1B2A4A', textAlign: 'center', marginBottom: SPACING.lg },
  description: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.gray600, textAlign: 'center', lineHeight: 24, paddingHorizontal: SPACING.lg },
  footer: { padding: SPACING.xl, paddingBottom: SPACING.xxxl },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING.xl, gap: SPACING.xs },
  dot: { height: 8, width: 8, borderRadius: 4 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skipText: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.gray400 },
  gradientButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg, gap: SPACING.sm, ...SHADOWS.md },
  nextText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.md, fontWeight: 'bold' },
});