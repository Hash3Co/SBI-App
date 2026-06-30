import React, { useRef, useEffect } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Animated, Dimensions, PanResponder } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.7;
const BOTTOM_SHEET_MIN_HEIGHT = 0;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ visible, onClose, children }) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: SCREEN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT,
        useNativeDriver: true,
        damping: 20,
        stiffness: 300,
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: SCREEN_HEIGHT,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newY = gestureState.dy + (SCREEN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT);
        if (newY > SCREEN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT && newY < SCREEN_HEIGHT) {
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: SCREEN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.bottomSheet, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.black + '50' },
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, height: BOTTOM_SHEET_MAX_HEIGHT, backgroundColor: COLORS.white, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, padding: SPACING.lg },
  handle: { width: 40, height: 4, backgroundColor: COLORS.gray300, borderRadius: BORDER_RADIUS.round, alignSelf: 'center', marginBottom: SPACING.md },
});