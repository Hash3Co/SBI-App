// src/hooks/useSessionManager.ts
import { useEffect, useRef } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { useAuth } from '../context/AuthenticationContext';

export const useSessionManager = (timeoutMinutes: number = 15) => {
  const { logout } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      // Auto-logout after inactivity
      Alert.alert(
        'Session Expired',
        'You have been logged out due to inactivity.',
        [{ text: 'OK', onPress: logout }]
      );
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appStateRef.current === 'background' && nextAppState === 'active') {
        // App came to foreground - require re-authentication
        resetTimer();
      }
      appStateRef.current = nextAppState;
    });

    resetTimer();

    return () => {
      subscription.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { resetTimer };
};