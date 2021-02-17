import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import axios from 'axios';

import {
  SafeAreaView, FlatList, RefreshControl,
} from 'react-native';

import * as dayjs from 'dayjs';
import tailwind from 'tailwind-rn';
import { ScrollView } from 'react-native-gesture-handler';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Button, Icon, Text,
} from '@ui-kitten/components';
import { useIsFocused } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Header } from '../components/Header';
import { Expense } from '../util/types';
import { getToken } from '../util/token';
import { useToast } from '../ToastProvider';

interface ExpenseItemProps {
  item: Expense;
  onPress: (id: string) => void
}

export const ExpenseItem: FC<ExpenseItemProps> = ({ item, onPress }) => (
  <div style={tailwind('mt-2')} onClick={() => onPress(item.id)}>
    <div style={tailwind('p-2 flex justify-between')}>
      <div style={tailwind('flex flex-col ml-1')}>
        <Text category="h5" status="primary">{item.category}</Text>
        <Text appearance="hint">{item.name}</Text>
      </div>
      <div style={tailwind('flex flex-col justify-between mr-1 text-right')}>
        <Text appearance="hint">{dayjs(item.date).format('DD.MM.')}</Text>
        <span style={tailwind('text-red-400 font-semibold')}>
          {item.costs}
          {' '}
          €
        </span>
      </div>
    </div>
    {/* <Divider style={tailwind("m")} /> */}
    <hr style={tailwind('border-0 bg-gray-300 text-gray-500 h-px mb-0 ml-6 mr-6')} />
  </div>
);

export const Expenses: FC<{
  navigation: StackNavigationProp<RootStackParamList, 'Expenses'>
}> = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { showToast } = useToast();

  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(false);
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/expense', {
        headers: {
          token: await getToken(),
        },
      });

      setExpenses(res.data);
    } catch (err) {
      console.error(err);
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }

    setLoading(false);
  }, [setExpenses]);

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, [isFocused]);

  return (
    <SafeAreaView style={tailwind('bg-white h-full w-full')}>
      <Header title="Expenses" />
      <ScrollView
        style={tailwind('w-full bg-white')}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} />
        }
      >
        <FlatList<Expense>
          style={tailwind('w-full')}
          renderItem={({ item }) => (
            <ExpenseItem
              item={item}
              onPress={id => { navigation.navigate('EditExpense', { id }); }}
            />
          )}
          data={expenses}
          keyExtractor={item => item.id}
        />
      </ScrollView>
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
