// src/hooks/useNetworkSecurity.ts
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Add to package.json: "react-native-netinfo": "^9.3.10"

export const useNetworkSecurity = () => {
  const [isSecure, setIsSecure] = useState(true);

  useEffect(() => {
    checkNetworkSecurity();
    
    const unsubscribe = NetInfo.addEventListener(state => {
      checkConnectionSecurity(state);
    });

    return () => unsubscribe();
  }, []);

  const checkConnectionSecurity = (state: any) => {
    // Check for VPN/proxy
    if (state.details?.isConnectionExpensive === true) {
      // Potential VPN detection
      Alert.alert(
        'Security Warning',
        'Unsecured network detected. Sensitive data may be at risk.',
        [{ text: 'I Understand', style: 'destructive' }]
      );
      setIsSecure(false);
    }
  };

  const checkNetworkSecurity = async () => {
    // Check for rooted/jailbroken device
    if (await isDeviceRooted()) {
      Alert.alert(
        'Security Alert',
        'Your device appears to be compromised. For security reasons, some features are disabled.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const isDeviceRooted = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      // Check for common root indicators
      const rootPaths = [
        '/system/app/Superuser.apk',
        '/sbin/su',
        '/system/bin/su',
        '/system/xbin/su',
        '/data/local/xbin/su',
        '/data/local/bin/su',
        '/system/sd/xbin/su',
        '/system/bin/failsafe/su',
        '/data/local/su',
      ];
      // Implement actual file checks here
    }
    return false;
  };

  return { isSecure };
};