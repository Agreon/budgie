import React, {
  FC,
} from 'react';
import {
  SafeAreaView, View, TouchableWithoutFeedback,
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
import { ReoccurringDates } from '../../components/ReoccurringDates';

/**
 * TODO: Extract more components
 * - Wrapper for List-Item
 * - Name?
 * - Costs?
 */
const ReoccurringExpenseItem: FC<{
  item: Reoccurring;
  onPress: (id: string) => void
}> = ({ item, onPress }) => (
  <TouchableWithoutFeedback delayPressIn={0} onPress={() => onPress(item.id)}>
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

/**
 *
 * Einkommen: ID:1, parentId: 3,<-
 * Einkommen Up1: ID: 2, parentId: 3
 * Einkommen Up2: ID: 3, parentId: null
 *
 * Einkommen 4 => ID, => SET parentId = newId where parentId = $1
 * => Geht nur, wenn ich sie dir mitschicken
 *=> Beim erstellen erstellen, schick ich sie nicht mit
 *
 *
 */

/**
 * TODO:
 * - history
 *  - add
 *  - delete
 *  - edit
  */
export const ReoccurringExpenseList: FC<{
  navigation: StackNavigationProp<ExpensesStackParamList, 'Expenses'>
}> = ({ navigation }) => (
  <SafeAreaView
    style={tailwind('h-full w-full bg-white')}
  >
    <List<Reoccurring>
      query={Query.ReoccurringExpenses}
      url="recurring?type=expense"
      renderItem={({ item }) => (
        <ReoccurringExpenseItem
          item={item}
          onPress={id => navigation.navigate('EditReoccurringExpense', { id })}
        />
      )}
    />
  </SafeAreaView>
);
