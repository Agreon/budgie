import { TopNavigation, Text } from '@ui-kitten/components';
import { RenderProp } from '@ui-kitten/components/devsupport';
import React, { FC } from 'react';
import tailwind from 'tailwind-rn';

export const Header: FC<{
    title: string;
    accessoryLeft?: RenderProp
}> = ({ title, accessoryLeft }) => (
  <TopNavigation
    title={() => <Text style={tailwind('text-xl font-bold')}>{title}</Text>}
    alignment="center"
    accessoryLeft={accessoryLeft}
    style={tailwind('mt-2')}
  />
);
