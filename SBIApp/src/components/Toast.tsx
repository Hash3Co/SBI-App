// src/components/Toast.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

let toastQueue: ToastMessage[] = [];
let listeners: ((toasts: ToastMessage[]) => void)[] = [];

export const showToast = (message: string, type: ToastType = 'info') => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 6);
  toastQueue = [...toastQueue, { id, message, type }];
  listeners.forEach(listener => listener(toastQueue));
  
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    listeners.forEach(listener => listener(toastQueue));
  }, 3000);
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    const handler = (newToasts: ToastMessage[]) => {
      setToasts(newToasts);
      if (newToasts.length > 0) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };
    
    listeners.push(handler);
    return () => { listeners = listeners.filter(l => l !== handler); };
  }, [fadeAnim, translateY]);

  if (toasts.length === 0) return null;

  const toast = toasts[0];
  
  const getConfig = (type: ToastType) => {
    switch (type) {
      case 'success': 
        return { bg: COLORS.success, icon: 'check-circle', textColor: COLORS.white };
      case 'error': 
        return { bg: COLORS.error, icon: 'error', textColor: COLORS.white };
      case 'warning': 
        return { bg: COLORS.warning, icon: 'warning', textColor: COLORS.white };
      default: 
        return { bg: COLORS.info, icon: 'info', textColor: COLORS.white };
    }
  };

  const config = getConfig(toast.type);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          backgroundColor: config.bg,
        },
      ]}
    >
      <Icon name={config.icon} size={24} color={config.textColor} style={styles.icon} />
      <Text style={[styles.message, { color: config.textColor }]} numberOfLines={2}>
        {toast.message}
      </Text>
      <TouchableOpacity 
        onPress={() => {
          toastQueue = toastQueue.filter(t => t.id !== toast.id);
          listeners.forEach(l => l(toastQueue));
        }}
        style={styles.closeButton}
      >
        <Icon name="close" size={20} color={config.textColor} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.lg,
    zIndex: 9999,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  closeButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
});