import React, { FC, useMemo } from 'react';
import {
  FlatList,
  View,
} from 'react-native';
import tailwind from 'tailwind-rn';
import {
  Icon,
  Text,
} from '@ui-kitten/components';
import { ItemDivider } from '../../components/ItemDivider';

const TrendArrow: FC<{
  current: OverviewListItem, previous: OverviewListItem[]
}> = ({ current, previous }) => {
  const prevItem = useMemo(
    () => previous.find(item => item.title === current.title),
    [current, previous],
  );

  if (!prevItem) {
    return <Icon fill="#f4511e" style={{ width: 32, height: 32 }} name="arrow-up" />;
  }

  if (current.totalCosts === prevItem.totalCosts) {
    return <Icon fill="grey" style={{ width: 32, height: 32, padding: 1 }} name="minus" />;
  }

  if (current.totalCosts < prevItem.totalCosts) {
    return <Icon fill="#8bc34a" style={{ width: 32, height: 32, marginBottom: 2 }} name="arrow-down" />;
  }

  return <Icon fill="#f4511e" style={{ width: 32, height: 32 }} name="arrow-up" />;
};

export interface OverviewListItem {
    title: string;
    totalCosts: number;
    percentage: number;
}

export const OverviewList: FC<{
    data: OverviewListItem[];
    previous: OverviewListItem[];
}> = ({ data, previous }) => (
  <FlatList<OverviewListItem>
    style={tailwind('w-full mt-2')}
    ItemSeparatorComponent={ItemDivider}
    renderItem={({ item }) => (
      <View style={tailwind('flex flex-row justify-between items-center pt-2 pb-2')}>
        <Text>{item.title}</Text>
        <View style={tailwind('flex flex-row items-center')}>
          <Text>
            {item.totalCosts}
            €
          </Text>
          {previous.length !== 0
            && (
            <View style={tailwind('pt-1')}>
              <TrendArrow current={item} previous={previous} />
            </View>
            )}
          <Text style={tailwind('ml-1 mr-1')}>|</Text>
          <Text style={[tailwind('font-bold ml-1'), item.percentage < 10 ? { marginLeft: 12 } : {}]}>
            {item.percentage}
            %
          </Text>
        </View>
      </View>
    )}
    data={data}
    keyExtractor={item => item.title}
  />
);
