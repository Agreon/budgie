import React, { FC } from 'react';
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

const isCurrentMoreThanPrevious = (current: OverviewListItem, previous: OverviewListItem[]) => {
  const prevItem = previous.find(item => item.title === current.title);

  if (!prevItem) {
    return true;
  }

  return parseFloat(current.totalCosts) > parseFloat(prevItem.totalCosts);
};

export interface OverviewListItem {
    title: string;
    totalCosts: string;
    percentage: string;
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
          <Text style={tailwind('ml-2 mr-1')}>|</Text>
          <Text style={[tailwind('font-bold ml-1'), item.percentage.length < 2 ? { marginLeft: 12 } : {}]}>
            {item.percentage}
            %
          </Text>
          {previous.length !== 0
            && (
            <View style={tailwind('pt-1')}>
              {isCurrentMoreThanPrevious(item, previous)
                ? <Icon fill="#8bc34a" style={{ width: 32, height: 32 }} name="arrow-up" />
                : <Icon fill="#f4511e" style={{ width: 32, height: 32, marginBottom: 2 }} name="arrow-down" />}
            </View>
            )}
        </View>
      </View>
    )}
    data={data}
    keyExtractor={item => item.title}
  />
);
