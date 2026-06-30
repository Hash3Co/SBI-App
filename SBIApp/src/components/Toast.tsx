import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

let toastQueue: ToastMessage[] = [];
let listeners: ((toasts: ToastMessage[]) => void)[] = [];

export const showToast = (message: string, type: ToastType = 'info') => {
  const id = Date.now().toString();
  toastQueue = [...toastQueue, { id, message, type }];
  listeners.forEach(listener => listener(toastQueue));
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    listeners.forEach(listener => listener(toastQueue));
  }, 3000);
};

export const Toast: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const handler = (newToasts: ToastMessage[]) => setToasts(newToasts);
    listeners.push(handler);
    if (toasts.length > 0) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
    return () => { listeners = listeners.filter(l => l !== handler); };
  }, [toasts, fadeAnim]);

  if (toasts.length === 0) return null;

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case 'success': return COLORS.success;
      case 'error': return COLORS.error;
      case 'warning': return COLORS.warning;
      default: return COLORS.info;
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: getBgColor(toasts[0].type) }]}>
      <Text style={styles.message}>{toasts[0].message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 100, left: SPACING.lg, right: SPACING.lg, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, zIndex: 1000 },
  message: { color: COLORS.white, fontSize: 14, textAlign: 'center' },
});