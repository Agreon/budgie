import React, { FC, useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';

import { Image, View } from 'react-native';
import { RootStackParamList } from '../../App';

// const SPLASH_TIMEOUT = 0;
const SPLASH_TIMEOUT = 3000;

export const Splash: FC<{
    navigation: StackNavigationProp<RootStackParamList, 'Splash'>
}> = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Expenses' }],
      });
    }, SPLASH_TIMEOUT);
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={{
        flex: 1, backgroundColor: 'powderblue', justifyContent: 'center', alignItems: 'center',
      }}
      />
      <View style={{
        flex: 2, backgroundColor: 'skyblue', justifyContent: 'center', alignItems: 'center',
      }}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={{
            width: 256,
            height: 256,
          }}
        />
      </View>
      <View style={{ flex: 3, backgroundColor: 'steelblue' }} />
    </View>
  );
};
