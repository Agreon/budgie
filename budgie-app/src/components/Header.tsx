import { TopNavigation, Text } from '@ui-kitten/components';
import { RenderProp } from '@ui-kitten/components/devsupport';
import React, { FC } from 'react';
import tailwind from 'tailwind-rn';

/**
 * TODO: Scroll-lists are looking through
 */
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
    style={tailwind('bg-white mt-4')}
  />
);
