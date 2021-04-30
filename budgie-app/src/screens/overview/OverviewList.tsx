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
import { ExpenseGroupItem } from './OverviewProvider';

const TrendArrow: FC<{
  value: {totalCosts: number, previousCosts: number}
}> = ({ value: {totalCosts, previousCosts} }) => {

  if (totalCosts === previousCosts) {
    return <Icon fill="grey" style={{ width: 32, height: 32, padding: 1 }} name="minus" />;
  }

  if (totalCosts < previousCosts) {
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
    items: ExpenseGroupItem[];
    showTrend: boolean;
}> = ({ items, showTrend }) => (
  <FlatList<ExpenseGroupItem>
    style={tailwind('w-full mt-2')}
    ItemSeparatorComponent={ItemDivider}
    renderItem={({ item: {name, totalCosts, percentage, previousCosts} }) => (
      <View style={tailwind('flex flex-row justify-between items-center pt-2 pb-2')}>
        <Text>{name}</Text>
        <View style={tailwind('flex flex-row items-center')}>
          <Text>
            {totalCosts}
            €
          </Text>
          {showTrend
            && (
            <View style={tailwind('pt-1')}>
              <TrendArrow value={{totalCosts, previousCosts}} />
            </View>
            )}
          <Text style={tailwind('ml-1 mr-1')}>|</Text>
          <Text style={[tailwind('font-bold ml-1'), percentage < 10 ? { marginLeft: 12 } : {}]}>
            {percentage}
            %
          </Text>
        </View>
      </View>
    )}
    data={items}
    keyExtractor={({name}) => name}
  />
);
