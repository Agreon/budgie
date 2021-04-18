import React, { FC } from 'react';
import {
  Text,
} from '@ui-kitten/components';
import { View } from 'react-native';
import tailwind from 'tailwind-rn';
import { Reoccurring } from '../../util/types';
import { ItemDate } from '../ItemDate';

export const ReoccurringDates: FC<{item: Reoccurring}> = ({ item }) => (
  <View style={tailwind('flex-row justify-end')}>
    { item.end_date ? (
      <Text>
        <Text appearance="hint">from </Text>
        <ItemDate date={item.start_date} />
        <Text appearance="hint">to </Text>
        <ItemDate date={item.end_date} />
      </Text>
    ) : (
      <>
        <Text appearance="hint">since </Text>
        <ItemDate date={item.start_date} />
      </>
    )}
  </View>
);
