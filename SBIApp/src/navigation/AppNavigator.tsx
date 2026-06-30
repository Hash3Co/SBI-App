// navigators/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthenticationContext';
import { AuthNavigator } from './AuthNavigator';
import { SMENavigator } from './SMENavigator';
import { InvestorNavigator } from './InvestorNavigator';
import { ROUTES } from '../constants/routes';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name={ROUTES.AUTH} component={AuthNavigator} />
      ) : user.role === 'sme' ? (
        <Stack.Screen name={ROUTES.SME_DASHBOARD} component={SMENavigator} />
      ) : (
        <Stack.Screen name={ROUTES.INVESTOR_DASHBOARD} component={InvestorNavigator} />
      )}
    </Stack.Navigator>
  );
};