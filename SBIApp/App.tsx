// App.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthenticationProvider } from './src/context/AuthenticationContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { TrainingProvider } from './src/context/TrainingContext';
import { PaymentProvider } from './src/context/PaymentContext';
import { SplashScreen } from './src/components/SplashScreen';
import { Toast } from './src/components/Toast';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { secureStorage } from './src/services/storage/secureStorage';
import { apiClient } from './src/services/api/client';
import { View, Text, AppState, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Disable yellow box warnings in production
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// Constants
const SESSION_TIMEOUT_HOURS = 24;
const SPLASH_SCREEN_DELAY = 1500;
const MAX_RETRY_ATTEMPTS = 3;

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [networkStatus, setNetworkStatus] = useState<boolean | null>(null);
  const appState = useRef(AppState.currentState);
  const initAttempts = useRef(0);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkStatus(state.isConnected ?? false);
      console.log('Network status:', state.isConnected ? 'Connected' : 'Disconnected');
    });

    return () => unsubscribe();
  }, []);

  // App state monitoring - refresh session when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App came to foreground - refreshing session');
        refreshSession();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const token = await secureStorage.getToken();
      if (token) {
        // Update last activity
        await secureStorage.setLastActivity();
        // Verify token
        await apiClient.get('/auth/verify/').catch(() => {
          console.log('Session verification failed');
        });
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
    }
  }, []);

  const initializeApp = useCallback(async () => {
    try {
      console.log('Initializing app...');

      // 1. Check network status
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.log('No network connection - skipping health check');
      }

      // 2. Check API health with timeout
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Health check timeout')), 5000);
        });
        
        const healthPromise = apiClient.get('/health');
        await Promise.race([healthPromise, timeoutPromise]);
        console.log('API is healthy');
      } catch (error) {
        console.log('API health check failed:', error instanceof Error ? error.message : 'Unknown error');
        // Don't fail initialization - app can work offline
      }

      // 3. Check and clean sessions with proper error handling
      try {
        const lastActivity = await secureStorage.getLastActivity();
        const inactiveTime = Date.now() - lastActivity;
        const timeoutMs = SESSION_TIMEOUT_HOURS * 60 * 60 * 1000;
        
        if (inactiveTime > timeoutMs) {
          console.log('Session expired - clearing data');
          await secureStorage.clearAll();
        } else {
          console.log('Session is valid');
          // Update last activity
          await secureStorage.setLastActivity();
        }
      } catch (error) {
        console.error('Session check failed:', error);
        // If we can't check session, we should be safe and clear
        await secureStorage.clearAll();
      }

      console.log('App initialized successfully');

    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      // Show splash screen for minimum time
      setTimeout(() => {
        setIsLoading(false);
      }, SPLASH_SCREEN_DELAY);
    }
  }, []);

  // Initialization with retry
  useEffect(() => {
    const initWithRetry = async () => {
      try {
        await initializeApp();
      } catch (error) {
        console.error('Init attempt failed:', error);
        if (initAttempts.current < MAX_RETRY_ATTEMPTS) {
          initAttempts.current++;
          console.log(`Retrying initialization (attempt ${initAttempts.current}/${MAX_RETRY_ATTEMPTS})`);
          setTimeout(() => {
            initWithRetry();
          }, 2000 * initAttempts.current);
        } else {
          console.error('All initialization attempts failed');
          setIsLoading(false);
        }
      }
    };

    initWithRetry();
  }, [initializeApp]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthenticationProvider>
              <TrainingProvider>
                <PaymentProvider>
                  <NavigationContainer>
                    <AppNavigator />
                    {/* Toast overlay */}
                    <View 
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0,
                        pointerEvents: 'box-none',
                        zIndex: 9999,
                      }}
                    >
                      <Toast />
                    </View>
                    {/* Offline indicator */}
                    {networkStatus === false && (
                      <View style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: '#FF3B30',
                        padding: 10,
                        alignItems: 'center',
                        zIndex: 9998,
                      }}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>
                          ⚠️ No Internet Connection
                        </Text>
                      </View>
                    )}
                  </NavigationContainer>
                </PaymentProvider>
              </TrainingProvider>
            </AuthenticationProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

export default App;