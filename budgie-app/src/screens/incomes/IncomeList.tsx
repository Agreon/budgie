import React, {
  FC,
} from 'react';
import {
  SafeAreaView, View, TouchableWithoutFeedback,
} from 'react-native';

import tailwind from 'tailwind-rn';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Button, Icon, Text,
} from '@ui-kitten/components';
import { IncomesStackParamList } from '.';
import { Income } from '../../util/types';
import { ItemDate } from '../../components/ItemDate';
import { List } from '../../components/List';
import { Query } from '../../hooks/use-paginated-query';

const IncomeItem: FC<{
    item: Income;
    onPress: (id: string) => void
  }> = ({ item, onPress }) => (
    <TouchableWithoutFeedback delayPressIn={0} onPress={() => onPress(item.id)}>
      <View style={tailwind('mt-2 mb-1 justify-center')}>
        <View style={tailwind('p-2 flex-row pt-0 pb-0 justify-between items-center')}>
          <View style={tailwind('ml-1')}>
            <Text category="h5" status="primary" style={tailwind('font-bold')}>{item.name}</Text>
          </View>
          <View style={tailwind('flex-col justify-between mr-1')}>
            <ItemDate date={item.date} />
            <Text category="h6" style={tailwind('text-red-400 font-bold text-right')}>
              {item.costs}
              {' '}
              €
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

export const IncomeList: FC<{
    navigation: StackNavigationProp<IncomesStackParamList, 'Incomes'>
  }> = ({ navigation }) => (
    <SafeAreaView
      style={tailwind('h-full w-full bg-white')}
    >
      <List<Income>
        query={Query.Incomes}
        url="income"
        renderItem={({ item }) => (
          <IncomeItem
            item={item}
            onPress={id => { navigation.navigate('EditIncome', { id }); }}
          />
        )}
      />
      <Button
        style={tailwind('absolute right-6 bottom-5')}
        status="info"
        accessoryLeft={props => (
          <Icon {...props} name="plus-outline" />
        )}
        onPress={() => navigation.navigate('CreateIncome')}
      />
    </SafeAreaView>
  );
