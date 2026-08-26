// src/navigation/SMENavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SMEDashboard } from '../screens/sme/SMEDashboard';
import { SMEProfileScreen } from '../screens/sme/SMEProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { MatchingScreen } from '../screens/matching/MatchingScreen';
import { CourseLibraryScreen } from '../screens/training/CourseLibraryScreen';
import { NotificationCenterScreen } from '../screens/notifications/NotificationCenterScreen';
import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const SMETabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, string> = {
          SMEDashboard: 'home',
          Matching: 'search',
          CourseLibrary: 'school',
          SMEProfile: 'person',
        };
        return <Icon name={icons[route.name] || 'circle'} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.gray400,
      tabBarStyle: { backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.gray200, height: 60, paddingBottom: 8, paddingTop: 8 },
      headerShown: false,
    })}
  >
    <Tab.Screen name="SMEDashboard" component={SMEDashboard} options={{ title: 'Home' }} />
    <Tab.Screen name="Matching" component={MatchingScreen} options={{ title: 'Matches' }} />
    <Tab.Screen name="CourseLibrary" component={CourseLibraryScreen} options={{ title: 'Courses' }} />
    <Tab.Screen name="SMEProfile" component={SMEProfileScreen} options={{ title: 'Profile' }} />
  </Tab.Navigator>
);

export const SMENavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SMETabs" component={SMETabs} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Notifications" component={NotificationCenterScreen} />
    <Stack.Screen name="CourseDetail" component={CourseLibraryScreen} />
  </Stack.Navigator>
);