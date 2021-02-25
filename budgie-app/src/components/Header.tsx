import { TopNavigation, Text } from '@ui-kitten/components';
import { RenderProp } from '@ui-kitten/components/devsupport';
import React, { FC } from 'react';
import { StatusBar, View } from 'react-native';
import tailwind from 'tailwind-rn';

export const Header: FC<{
    title: string;
    accessoryLeft?: RenderProp;
    accessoryRight?: RenderProp;
}> = ({
  title, accessoryLeft, accessoryRight,
}) => (
  <View
    style={{
      paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight - 10 : 0,
      backgroundColor: 'white',
    }}
  >
    <TopNavigation
      title={() => (
        <Text style={tailwind('text-xl font-bold')}>
          {title}
        </Text>
      )}
      alignment="center"
      accessoryLeft={accessoryLeft}
      accessoryRight={accessoryRight}
    />
  </View>
);
