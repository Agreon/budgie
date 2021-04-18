import { Spinner } from '@ui-kitten/components';
import { RenderProp } from '@ui-kitten/components/devsupport';
import React, { FC } from 'react';
import { ScrollView, View } from 'react-native';
import tailwind from 'tailwind-rn';
import { BackAction } from './BackAction';
import { Header } from './Header';

export interface PageWrapperProps {
    title: string;
    loading?: boolean;
    accessoryRight?: RenderProp;
}

export const PageWrapper: FC<PageWrapperProps> = ({
  children,
  title,
  loading,
  accessoryRight,
}) => (
  <ScrollView
    stickyHeaderIndices={[0]}
    style={tailwind('bg-white h-full')}
    contentContainerStyle={tailwind('h-full')}
  >
    <Header
      title={title}
      accessoryLeft={props => <BackAction {...props} />}
      accessoryRight={accessoryRight}
    />
    {loading ? (
      <View style={tailwind('absolute w-full h-full flex items-center bg-gray-100 bg-opacity-25 justify-center z-10')}>
        <Spinner size="giant" />
      </View>
    ) : (
      <View
        style={tailwind('flex pl-5 pr-5')}
      >
        {children}
      </View>
    )}
  </ScrollView>
);
