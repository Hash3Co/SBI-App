import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants/theme';

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, height = 8, color = COLORS.success }) => {
  return (
    <View style={[styles.container, { height }]}>
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: color, height }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.gray200, borderRadius: BORDER_RADIUS.round, overflow: 'hidden' },
  fill: { borderRadius: BORDER_RADIUS.round },
});