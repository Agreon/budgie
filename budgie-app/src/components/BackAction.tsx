import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Icon,
  IconProps,
  TopNavigationAction,
} from '@ui-kitten/components';
import { ExpensesStackParamList } from '../screens/expenses';

const BackIcon = (props: IconProps) => (
  <Icon {...props} name="arrow-back" />
);

export const BackAction = ({ navigation }: {
  // TODO: Need a Generic type for that
  navigation: StackNavigationProp<ExpensesStackParamList, keyof ExpensesStackParamList>
}) => (
  <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
);
