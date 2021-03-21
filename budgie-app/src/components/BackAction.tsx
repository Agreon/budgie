import React from 'react';
import {
  Icon,
  IconProps,
  TopNavigationAction,
} from '@ui-kitten/components';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

const BackIcon = (props: IconProps) => (
  <Icon {...props} name="arrow-back" />
);

export const BackAction = <T extends ParamListBase>({ navigation }: {
  navigation: NavigationProp<T, keyof T>
}) => (
  <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
  );
