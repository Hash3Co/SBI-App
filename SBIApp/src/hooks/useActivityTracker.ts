import { useEffect } from 'react';
import { secureStorage } from '../services/storage/secureStorage';

export const useActivityTracker = () => {
  useEffect(() => {
    const updateActivity = () => secureStorage.setLastActivity();
    
    // Track user interactions
    const events = ['click', 'scroll', 'press', 'touchstart'];
    // Note: In React Native, you'd add these to specific touchable components
    
    updateActivity();
    return () => {};
  }, []);
};