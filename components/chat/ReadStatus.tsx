import React from 'react';
import { View } from 'react-native';
import Icon from '@/assets/icons';

interface ReadStatusProps {
  isRead: boolean;
  isCurrentUser: boolean;
  size?: number;
  color?: string;
}

const ReadStatus: React.FC<ReadStatusProps> = ({ 
  isRead, 
  isCurrentUser, 
  size = 12, 
  color = 'rgba(255,255,255,0.6)' 
}) => {
  if (!isCurrentUser) return null;

  return (
    <View style={{ flexDirection: 'row', marginTop: 2 }}>
      {isRead ? (
        <>
          <Icon name="check" size={size} color="#4CAF50" />
          <Icon name="check" size={size} color="#4CAF50" style={{ marginLeft: -8 }} />
        </>
      ) : (
        <Icon name="check" size={size} color={color} />
      )}
    </View>
  );
};

export default ReadStatus;