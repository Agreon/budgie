import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import axios from 'axios';

import {
  SafeAreaView, FlatList, RefreshControl, View, TouchableWithoutFeedback,
} from 'react-native';

import dayjs from 'dayjs';
import tailwind from 'tailwind-rn';
import { ScrollView } from 'react-native-gesture-handler';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Button, Divider, Icon, Text,
} from '@ui-kitten/components';
import { useIsFocused } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
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
  <TouchableWithoutFeedback delayPressIn={0} onPressIn={() => onPress(item.id)}>
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
      await SplashScreen.hideAsync();

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
