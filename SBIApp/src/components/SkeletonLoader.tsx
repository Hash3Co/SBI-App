import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

export const SkeletonLoader: React.FC = () => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmerValue, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerValue]);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={styles.container}>
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatar} />
            <View style={styles.headerText}>
              <View style={styles.title} />
              <View style={styles.subtitle} />
            </View>
          </View>
          <View style={styles.content}>
            <View style={styles.line} />
            <View style={styles.lineShort} />
          </View>
          <Animated.View style={[styles.shimmer, { transform: [{ translateX }] }]} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: SPACING.lg },
  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, overflow: 'hidden' },
  header: { flexDirection: 'row', marginBottom: SPACING.md },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.gray200, marginRight: SPACING.md },
  headerText: { flex: 1, justifyContent: 'center' },
  title: { width: '70%', height: 16, backgroundColor: COLORS.gray200, borderRadius: BORDER_RADIUS.sm, marginBottom: SPACING.xs },
  subtitle: { width: '50%', height: 12, backgroundColor: COLORS.gray200, borderRadius: BORDER_RADIUS.sm },
  content: { gap: SPACING.sm },
  line: { height: 14, backgroundColor: COLORS.gray200, borderRadius: BORDER_RADIUS.sm, width: '100%' },
  lineShort: { height: 14, backgroundColor: COLORS.gray200, borderRadius: BORDER_RADIUS.sm, width: '70%' },
  shimmer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.white + '80' },
});