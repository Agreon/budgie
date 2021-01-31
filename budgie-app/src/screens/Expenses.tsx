import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import axios from 'axios';

import {
  View, SafeAreaView, FlatList, RefreshControl,
} from 'react-native';

import * as dayjs from 'dayjs';

import tailwind from 'tailwind-rn';
import { ScrollView } from 'react-native-gesture-handler';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Button, Icon, Text, Spinner, IconProps,
} from '@ui-kitten/components';
import { useIsFocused } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Header } from '../components/Header';

// TODO: Move to common lib? => converter https://github.com/tkrajina/typescriptify-golang-structs
interface Expense {
  ID: string;
  Type: string;
  Costs: string;
  Name?: string;
  Time: Date;
}

export const ExpenseItem: FC<{ item: Expense }> = ({ item }) => (
  <div style={tailwind('mt-2')}>
    <div style={tailwind('p-2 flex justify-between')}>
      <div style={tailwind('flex flex-col ml-1')}>
        <Text category="h4" status="primary">{item.Type}</Text>
        <Text appearance="hint">{item.Name}</Text>
      </div>
      <div style={tailwind('flex flex-col justify-between mr-1 text-right')}>
        <Text appearance="hint">{dayjs(item.Time).format('DD.MM.')}</Text>
        <span style={tailwind('text-red-400 font-semibold')}>
          {item.Costs}
          {' '}
          €
        </span>
      </div>
    </div>
    {/* <Divider style={tailwind("m")} /> */}
    <hr style={tailwind('border-0 bg-gray-300 text-gray-500 h-px mb-0 ml-6 mr-6')} />
  </div>

);

const PlusIcon = (props: IconProps) => (
  <Icon {...props} name="plus-outline" />
);

/**
 * TODO: RefreshControl
 */
export const Expenses: FC<{
  navigation: StackNavigationProp<RootStackParamList, 'Expenses'>
}> = ({ navigation }) => {
  const isFocused = useIsFocused();

  const [expenses, setExpenses] = useState<Expense[] | undefined>([]);

  const [loading, setLoading] = useState(false);
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/expense');
      setExpenses(res.data);
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [isFocused]);

  return (
    <SafeAreaView style={tailwind('bg-white h-full w-full')}>
      <Header title="Expenses" />
      {loading
        && (
          <View style={tailwind('absolute w-full h-full flex items-center bg-gray-300 bg-opacity-25 justify-center z-10')}>
            <Spinner size="giant" />
          </View>
        )}
      <ScrollView
        style={tailwind('w-full bg-white')}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} />
        }
      >
        <FlatList<Expense>
          style={tailwind('w-full')}
          renderItem={({ item }) => <ExpenseItem item={item} />}
          data={expenses}
          keyExtractor={(item) => item.ID}
        />
      </ScrollView>
      <Button
        style={tailwind('absolute right-6 bottom-5')}
        status="info"
        accessoryLeft={PlusIcon}
        onPress={() => navigation.navigate('CreateExpense')}
      />
    </SafeAreaView>
  );
};
