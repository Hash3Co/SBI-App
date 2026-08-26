// App.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, AppState, Platform, StatusBar } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthenticationProvider } from './src/context/AuthenticationContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { TrainingProvider } from './src/context/TrainingContext';
import { PaymentProvider } from './src/context/PaymentContext';
import { MatchingProvider } from './src/context/MatchingContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { SplashScreen } from './src/components/SplashScreen';
import { ToastContainer } from './src/components/Toast';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { secureStorage } from './src/services/storage/secureStorage';
import { apiClient } from './src/services/api/client';
import { APP_CONFIG } from './src/config/appConfig';
import { COLORS } from './src/constants/theme';
import { API_CONFIG } from './src/config/apiConfig';

// Disable yellow box warnings in production
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

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
      console.log('📶 Network status:', state.isConnected ? 'Connected' : 'Disconnected');
    });
    return () => unsubscribe();
  }, []);

  // App state monitoring
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('🔄 App came to foreground - refreshing session');
        refreshSession();
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const token = await secureStorage.getToken();
      if (token) {
        await secureStorage.setLastActivity();
        try {
          await apiClient.get('/auth/verify/');
        } catch (error) {
          console.log('⚠️ Session verification failed');
        }
      }
    } catch (error) {
      console.error('❌ Session refresh failed:', error);
    }
  }, []);

  const initializeApp = useCallback(async () => {
    try {
      console.log(`🚀 Initializing ${APP_CONFIG.name}...`);
      console.log(`🔗 API URL: ${API_CONFIG.baseURL}`);
      console.log(`📱 Platform: ${Platform.OS}`);
      console.log(`🌐 Environment: ${__DEV__ ? 'Development' : 'Production'}`);

      // Check network
      const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
      setNetworkStatus(isConnected);
      
      if (!isConnected) {
        console.log('⚠️ No network connection available');
      } else {
        console.log('✅ Network connected');
      }

      // Check session
      try {
        const lastActivity = await secureStorage.getLastActivity();
        const inactiveTime = Date.now() - lastActivity;
        const timeoutMs = SESSION_TIMEOUT_HOURS * 60 * 60 * 1000;

        if (inactiveTime > timeoutMs) {
          console.log('⏰ Session expired - clearing data');
          await secureStorage.clearAll();
        } else {
          console.log('✅ Session is valid');
          await secureStorage.setLastActivity();
        }
      } catch (error) {
        console.error('❌ Session check failed:', error);
        await secureStorage.clearAll();
      }

      console.log(`✅ ${APP_CONFIG.name} initialized successfully`);

    } catch (error) {
      console.error('❌ App initialization error:', error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, SPLASH_SCREEN_DELAY);
    }
  }, []);

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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthenticationProvider>
              <NotificationProvider>
                <MatchingProvider>
                  <TrainingProvider>
                    <PaymentProvider>
                      <NavigationContainer>
                        <AppNavigator />
                        <ToastContainer />
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
                </MatchingProvider>
              </NotificationProvider>
            </AuthenticationProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

export default App;