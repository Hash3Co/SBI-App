import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getValidIconName } from '../../utils/iconUtils';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  onPress?: () => void;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#000000', onPress }) => {
  const [iconError, setIconError] = useState(false);
  const validIconName = getValidIconName(name);
  const finalIconName = iconError ? 'circle' : validIconName;

  const IconComponent = () => (
    <MaterialIcons 
      name={finalIconName} 
      size={size} 
      color={color}
      onError={() => setIconError(true)}
    />
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <IconComponent />
      </TouchableOpacity>
    );
  }
  
  return <IconComponent />;
};