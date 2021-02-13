import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Icon,
  IconProps,
  TopNavigationAction,
} from '@ui-kitten/components';
import { RootStackParamList } from '../../App';

const BackIcon = (props: IconProps) => (
  <Icon {...props} name="arrow-back" />
);

export const BackAction = ({ navigation }: {
  navigation: StackNavigationProp<RootStackParamList, keyof RootStackParamList>
}) => (
  <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
);
