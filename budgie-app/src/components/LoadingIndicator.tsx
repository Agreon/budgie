import { Spinner } from '@ui-kitten/components';
import React from 'react';
import { View } from 'react-native';
import tailwind from 'tailwind-rn';

export const LoadingIndicator = (props: any) => (
  <View style={tailwind('justify-center items-center')} {...props}>
    <Spinner size="small" />
  </View>
);
