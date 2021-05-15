import React, {
  FC,
} from 'react';
import {
  SafeAreaView, View, TouchableWithoutFeedback, StyleProp, ViewStyle,
} from 'react-native';

import tailwind from 'tailwind-rn';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Text,
} from '@ui-kitten/components';
import { Reoccurring } from '../../util/types';
import { ExpensesStackParamList } from '.';
import { Query } from '../../hooks/use-paginated-query';
import { List } from '../../components/List';
import { ReoccurringDates } from '../../components/reoccurring/ReoccurringDates';

/**
 * TODO: Extract more components
 * - Name?
 * - Costs?
 */
export const ReoccurringExpenseItem: FC<{
  item: Reoccurring;
  onPress?: (id: string) => void
  containerStyle?: StyleProp<ViewStyle>;
}> = ({ item, onPress, containerStyle }) => (
  <TouchableWithoutFeedback
    delayPressIn={0}
    onPress={() => (onPress ? onPress(item.id) : undefined)}
  >
    <View style={containerStyle || tailwind('p-2 flex-row justify-between')}>
      <View style={tailwind('flex-col ml-1 pr-2 flex-1')}>
        <Text category="h5" status="primary" style={tailwind('font-bold')}>{item.category}</Text>
        <View style={tailwind('flex-row items-center')}>
          <Text
            appearance="hint"
            numberOfLines={1}
            style={item.name ? tailwind('mr-2') : undefined}
          >
            {item.name}
          </Text>
        </View>
      </View>
      <View style={tailwind('flex-col justify-between mr-1 flex-1')}>
        <ReoccurringDates item={item} />
        <Text category="h6" style={tailwind('text-red-400 font-bold text-right')}>
          {item.costs}
          {' '}
          €
        </Text>
      </View>
    </View>
  </TouchableWithoutFeedback>
);

export const ReoccurringExpenseList: FC<{
  navigation: StackNavigationProp<ExpensesStackParamList, 'Expenses'>
}> = ({ navigation }) => (
  <SafeAreaView
    style={tailwind('h-full w-full bg-white')}
  >
    <List<Reoccurring>
      query={Query.ReoccurringExpenses}
      url="recurring"
      params={{
        type: 'expense',
      }}
      renderItem={({ item }) => (
        <ReoccurringExpenseItem
          item={item}
          onPress={id => navigation.navigate('EditReoccurringExpense', { id })}
        />
      )}
    />
  </SafeAreaView>
);
