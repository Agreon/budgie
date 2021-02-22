import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import {
  SafeAreaView, FlatList, RefreshControl, View, TouchableWithoutFeedback,
} from 'react-native';

import dayjs from 'dayjs';
import tailwind from 'tailwind-rn';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Button, Divider, Icon, Text,
} from '@ui-kitten/components';
import { useIsFocused } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { RootStackParamList } from '../../App';
import { Header } from '../components/Header';
import { Expense } from '../util/types';
import { useToast } from '../ToastProvider';
import { useExpenses } from '../EntityProvider';
import { deleteToken } from '../util/token';

export const ExpenseItem: FC<{
  item: Expense;
  onPress: (id: string) => void
}> = ({ item, onPress }) => (
  <TouchableWithoutFeedback delayPressIn={0} onPress={() => onPress(item.id)}>
    <View style={tailwind('mt-2')}>
      <View style={tailwind('p-2 flex-row justify-between')}>
        <View style={tailwind('flex-col ml-1')}>
          <Text category="h5" status="primary" style={tailwind('font-bold')}>{item.category}</Text>
          <Text appearance="hint">{item.name}</Text>
        </View>
        <View style={tailwind('flex-col justify-between mr-1')}>
          <Text appearance="hint" style={tailwind('text-right')}>{dayjs(item.date).format('DD.MM.')}</Text>
          <Text category="h6" style={tailwind('text-red-400 font-bold text-right')}>
            {item.costs}
            {' '}
            €
          </Text>
        </View>
      </View>
      <Divider style={tailwind('bg-gray-300 ml-6 mr-6 mt-2 mb-1')} />
    </View>
  </TouchableWithoutFeedback>
);

export const Expenses: FC<{
  navigation: StackNavigationProp<RootStackParamList, 'Expenses'>
}> = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { showToast } = useToast();

  const { expenses, refetch } = useExpenses();

  const [loading, setLoading] = useState(false);
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await refetch();
    } catch (err) {
      // TODO: Move into handler
      if (err.response?.status === 401) {
        await deleteToken();
        showToast({ status: 'danger', message: 'Please log in again' });

        navigation.navigate('Login');
        return;
      }
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }

    setLoading(false);
  }, [refetch, navigation, showToast]);

  useEffect(() => {
    (async () => {
      await SplashScreen.hideAsync();

      await fetchData();
    })();
  }, [isFocused]);

  return (
    <SafeAreaView
      style={tailwind('h-full w-full bg-white')}
    >
      <FlatList<Expense>
        style={tailwind('w-full')}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={() => <Header title="Expenses" />}
        ListEmptyComponent={() => <Text>There are no expenses yet</Text>}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} />
        }
        renderItem={({ item }) => (
          <ExpenseItem
            item={item}
            onPress={id => { navigation.navigate('EditExpense', { id }); }}
          />
        )}
        data={expenses}
        keyExtractor={item => item.id}
        onEndReachedThreshold={0.5}
        onEndReached={() => console.log('END: TODO Load more expenses')}
      />
      <Button
        style={tailwind('absolute right-6 bottom-5')}
        status="info"
        accessoryLeft={props => (
          <Icon {...props} name="plus-outline" />
        )}
        onPress={() => navigation.navigate('CreateExpense')}
      />
    </SafeAreaView>
  );
};
