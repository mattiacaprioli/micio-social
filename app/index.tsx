import { View, ViewStyle } from 'react-native';
import React from 'react';
import Loading from '../components/Loading';

const containerStyle: ViewStyle = {
  flex: 1, 
  alignItems: 'center', 
  justifyContent: 'center'
};

const Index: React.FC = () => {
  return (
    <View style={containerStyle}>
      <Loading />
    </View>
  );
};

export default Index;
