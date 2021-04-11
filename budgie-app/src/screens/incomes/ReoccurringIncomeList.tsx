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
import { Query } from '../../hooks/use-paginated-query';
import { List } from '../../components/List';
import { IncomesStackParamList } from '.';
import { ReoccurringDates } from '../../components/ReoccurringDates';

// TODO: Styling
const ReoccurringIncomeItem: FC<{
    item: Reoccurring;
    onPress: (id: string) => void
  }> = ({ item, onPress }) => (
    <TouchableWithoutFeedback delayPressIn={0} onPress={() => onPress(item.id)}>
      <View style={tailwind('p-2 flex-row justify-between')}>
        <View style={tailwind('flex-col ml-1 pr-2 justify-center')}>
          <Text category="h5" status="primary" style={tailwind('font-bold')} numberOfLines={1}>{item.name}</Text>
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

export const ReoccurringIncomeList: FC<{
    navigation: StackNavigationProp<IncomesStackParamList, 'Incomes'>
  }> = ({ navigation }) => (
    <SafeAreaView
      style={tailwind('h-full w-full bg-white')}
    >
      <List<Reoccurring>
        query={Query.ReoccurringIncomes}
        url="recurring?type=income"
        renderItem={({ item }) => (
          <ReoccurringIncomeItem
            item={item}
            onPress={id => navigation.navigate('EditReoccurringIncome', { id })}
          />
        )}
      />
    </SafeAreaView>
  );
