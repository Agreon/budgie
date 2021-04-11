import { Spinner } from '@ui-kitten/components';
import { EvaSize, EvaStatus } from '@ui-kitten/components/devsupport';
import React, { FC } from 'react';
import { ImageProps, View } from 'react-native';
import tailwind from 'tailwind-rn';

export interface LoadingIndicatorProps extends Partial<ImageProps> {
  status?: EvaStatus
  size?: EvaSize
}

export const LoadingIndicator: FC<LoadingIndicatorProps | undefined> = (
  { status, size, ...props },
) => (
  <View style={tailwind('justify-center items-center')} {...props}>
    <Spinner status={status} size={size ?? 'small'} />
  </View>
);
