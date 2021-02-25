import { TopNavigation, Text } from '@ui-kitten/components';
import { RenderProp } from '@ui-kitten/components/devsupport';
import React, { FC } from 'react';
import { StatusBar } from 'react-native';
import tailwind from 'tailwind-rn';

export const Header: FC<{
    title: string;
    accessoryLeft?: RenderProp;
    accessoryRight?: RenderProp;
}> = ({ title, accessoryLeft, accessoryRight }) => (
  <TopNavigation
    title={() => <Text style={tailwind('text-xl font-bold')}>{title}</Text>}
    alignment="center"
    accessoryLeft={accessoryLeft}
    accessoryRight={accessoryRight}
    style={{
      ...tailwind('bg-white'),
      marginTop: StatusBar.currentHeight,
    }}
  />
);
