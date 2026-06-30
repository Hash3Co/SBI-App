// navigators/SMENavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SMEDashboard } from '../screens/sme/SMEDashboard';
import { SMEProfileScreen } from '../screens/sme/SMEProfileScreen';
import { ReadinessScoreScreen } from '../screens/sme/ReadinessScoreScreen';
import { MatchingScreen } from '../screens/matching/MatchingScreen';
import { MarketplaceScreen } from '../screens/marketplace/MarketplaceScreen';
import { CourseLibraryScreen } from '../screens/training/CourseLibraryScreen';
import { CourseDetailScreen } from '../screens/training/CourseDetailScreen';
import { VideoPlayerScreen } from '../screens/training/VideoPlayerScreen';
import { QuizScreen } from '../screens/training/QuizScreen';
import { CertificateScreen } from '../screens/training/CertificateScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { NotificationCenterScreen } from '../screens/notifications/NotificationCenterScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { PaymentMethodScreen } from '../screens/payment/PaymentMethodScreen';
import { PaymentHistoryScreen } from '../screens/payment/PaymentHistoryScreen';
import { SubscriptionScreen } from '../screens/payment/SubscriptionScreen';
import { COLORS } from '../constants/theme';
import { ROUTES } from '../constants/routes';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const SMETabs = () => (
  <Tab.Navigator 
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName = '';
        // ✅ Use ROUTES constants instead of string literals
        if (route.name === ROUTES.SME_DASHBOARD) iconName = 'home';
        else if (route.name === ROUTES.MARKETPLACE) iconName = 'store';
        else if (route.name === ROUTES.COURSE_LIBRARY) iconName = 'school';
        else if (route.name === ROUTES.SME_PROFILE) iconName = 'person';
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.gray400,
      tabBarStyle: { 
        backgroundColor: COLORS.white, 
        borderTopWidth: 1, 
        borderTopColor: COLORS.gray200, 
        height: 60, 
        paddingBottom: 8, 
        paddingTop: 8 
      },
      headerShown: false,
    })}
  >
    {/* ✅ Use ROUTES constants for tab names */}
    <Tab.Screen name={ROUTES.SME_DASHBOARD} component={SMEDashboard} />
    <Tab.Screen name={ROUTES.MARKETPLACE} component={MarketplaceScreen} />
    <Tab.Screen name={ROUTES.COURSE_LIBRARY} component={CourseLibraryScreen} />
    <Tab.Screen name={ROUTES.SME_PROFILE} component={SMEProfileScreen} />
  </Tab.Navigator>
);

export const SMENavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SMETabs" component={SMETabs} />
    
    {/* SME Screens */}
    <Stack.Screen name={ROUTES.SME_PROFILE} component={SMEProfileScreen} />
    <Stack.Screen name={ROUTES.READINESS_SCORE} component={ReadinessScoreScreen} />
    
    {/* Shared Screens */}
    <Stack.Screen name={ROUTES.MATCHING} component={MatchingScreen} />
    <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
    <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationCenterScreen} />
    <Stack.Screen name={ROUTES.ANALYTICS} component={AnalyticsScreen} />
    
    {/* Training Screens */}
    <Stack.Screen name={ROUTES.COURSE_DETAIL} component={CourseDetailScreen} />
    <Stack.Screen name={ROUTES.VIDEO_PLAYER} component={VideoPlayerScreen} />
    <Stack.Screen name={ROUTES.QUIZ} component={QuizScreen} />
    <Stack.Screen name={ROUTES.CERTIFICATE} component={CertificateScreen} />
    
    {/* Payment Screens */}
    <Stack.Screen name={ROUTES.PAYMENT_METHOD} component={PaymentMethodScreen} />
    <Stack.Screen name={ROUTES.PAYMENT_HISTORY} component={PaymentHistoryScreen} />
    <Stack.Screen name={ROUTES.SUBSCRIPTION} component={SubscriptionScreen} />
  </Stack.Navigator>
);