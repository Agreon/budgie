import React, {
  FC, useEffect,
} from 'react';
import {
  SafeAreaView, View, TouchableWithoutFeedback,
} from 'react-native';

import tailwind from 'tailwind-rn';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Text,
} from '@ui-kitten/components';
import * as SplashScreen from 'expo-splash-screen';
import { Expense } from '../../util/types';
import { ExpensesStackParamList } from '.';
import { ItemDate } from '../../components/ItemDate';
import { Query } from '../../hooks/use-paginated-query';
import { List } from '../../components/List';

export const ExpenseItem: FC<{
  item: Expense;
  onPress?: (id: string) => void
}> = ({ item, onPress }) => (
  <TouchableWithoutFeedback
    delayPressIn={0}
    onPress={() => (onPress ? onPress(item.id) : undefined)}
  >
    <View style={tailwind('p-2 flex-row justify-between')}>
      <View style={{
        ...tailwind('flex-col ml-1 pr-2'),
        flex: 2,
      }}
      >
        <Text category="h5" status="primary" style={tailwind('font-bold')}>{item.category}</Text>
        <View style={tailwind('flex-row items-center')}>
          <Text
            appearance="hint"
            numberOfLines={1}
            style={item.name ? tailwind('mr-2') : undefined}
          >
            {item.name}
          </Text>
          {item.tags![0] != null
            && (
              <Text
                style={{
                  ...tailwind('border rounded border-gray-300 p-1'),
                  marginTop: 2,
                }}
                category="c1"
              >
                {item.tags![0].name}
              </Text>
            )}
        </View>
      </View>
      <View style={tailwind('flex-col justify-between mr-1 flex-1')}>
        <ItemDate date={item.date} />
        <Text category="h6" style={tailwind('text-red-400 font-bold text-right')}>
          {item.costs}
          {' '}
          €
        </Text>
      </View>
    </View>
  </TouchableWithoutFeedback>
);

export const ExpenseList: FC<{
  navigation: StackNavigationProp<ExpensesStackParamList, 'Expenses'>
}> = ({ navigation }) => {
  useEffect(() => {
    (async () => {
      await SplashScreen.hideAsync();
    })();
  }, []);

  return (
    <SafeAreaView
      style={tailwind('h-full w-full bg-white')}
    >
      <List<Expense>
        query={Query.Expenses}
        url="expense"
        renderItem={({ item }) => (
          <ExpenseItem
            item={item}
            onPress={id => navigation.navigate('EditExpense', { id })}
          />
        )}
      />
    </SafeAreaView>
  );
};
