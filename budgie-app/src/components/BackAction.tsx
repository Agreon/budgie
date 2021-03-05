import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Icon,
  IconProps,
  TopNavigationAction,
} from '@ui-kitten/components';
import { ParamListBase } from '@react-navigation/native';

const BackIcon = (props: IconProps) => (
  <Icon {...props} name="arrow-back" />
);

export const BackAction = <T extends ParamListBase>({ navigation }: {
  // TODO: Need a Generic type for that
  navigation: StackNavigationProp<T, keyof T>
}) => (
  <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
  );
