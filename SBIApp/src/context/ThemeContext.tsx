// ThemeContext.tsx - Fixed version
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightThemeColors, darkThemeColors, ThemeColors } from '../constants/theme';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = (newTheme: ThemeType) => {
    try {
      setThemeState(newTheme);
      AsyncStorage.setItem('appTheme', newTheme).catch(error => {
        console.error('Failed to save theme:', error);
      });
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const colors = theme === 'light' ? lightThemeColors : darkThemeColors;

  const value = {
    theme,
    colors,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };

  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to get theme-aware styles
export const useThemeStyles = <T extends Record<string, any>>(
  styles: (colors: ThemeColors) => T
): T => {
  const { colors } = useTheme();
  return styles(colors);
};