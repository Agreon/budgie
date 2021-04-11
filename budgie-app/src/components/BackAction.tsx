import React from 'react';
import {
  Icon,
  IconProps,
  TopNavigationAction,
} from '@ui-kitten/components';
import {
  useNavigation,
} from '@react-navigation/native';
import { ImageProps } from 'react-native';

const BackIcon = (props: IconProps) => (
  <Icon {...props} name="arrow-back" />
);

export const BackAction = (props: Partial<ImageProps>) => {
  const navigation = useNavigation();
  return (
    <TopNavigationAction {...props} icon={BackIcon} onPress={() => navigation.goBack()} />
  );
};
