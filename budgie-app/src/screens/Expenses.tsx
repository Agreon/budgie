import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import axios from 'axios';
import { Entypo } from '@expo/vector-icons';

import {
  View, SafeAreaView, FlatList, RefreshControl, TouchableOpacity,
} from 'react-native';

import * as dayjs from 'dayjs';

import tailwind from 'tailwind-rn';
import { ScrollView } from 'react-native-gesture-handler';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

// TODO: Move to common lib? => converter https://github.com/tkrajina/typescriptify-golang-structs
interface Expense {
  id: string;
  type: string;
  costs: string;
  name?: string;
  date: Date;
}

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    type: 'Futter',
    costs: '33.33',
    name: 'Mc Donalds',
    date: new Date(),
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    type: 'Futter',
    costs: '128.47',
    name: 'Shiraz',
    date: new Date(),
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    type: 'Futter',
    costs: '3.12',
    name: 'Kochen :/',
    date: new Date(),
  },
];

export const ExpenseItem: FC<{ item: Expense }> = ({ item }) => (
  <div style={tailwind('mt-2')}>
    <div style={tailwind('p-2 flex justify-between')}>
      <div style={tailwind('flex flex-col ml-1')}>
        <h3 style={tailwind('mt-0 text-blue-500')}>{item.type}</h3>
        <span style={tailwind('text-gray-500')}>{item.name}</span>
      </div>
      <div style={tailwind('flex flex-col justify-between mr-1 text-right')}>
        <span style={tailwind('text-gray-500')}>{dayjs(item.date).format('DD.MM.')}</span>
        <span style={tailwind('text-red-400 font-semibold')}>
          {item.costs}
          {' '}
          €
        </span>
      </div>
    </div>
    <hr style={tailwind('border-0 bg-gray-300 text-gray-500 h-px mb-0 ml-6 mr-6')} />
  </div>

);

export const AddExpenseButton: FC<{
  navigation: StackNavigationProp<RootStackParamList, 'Expenses'>
}> = ({ navigation }) => (
  <TouchableOpacity
    onPress={() => navigation.navigate('CreateExpense')}
  >
    <div style={tailwind('flex justify-center items-center m-1 w-10 h-10 rounded-full bg-blue-500')}>
      <Entypo name="plus" size={32} color="black" />
    </div>
  </TouchableOpacity>
);

/**
 * TODO: RefreshControl
 */
export const Expenses: FC<{
    navigation: StackNavigationProp<RootStackParamList, 'Expenses'>
}> = ({ navigation }) => {
  const [notes] = useState<Expense[] | undefined>([]);
  const [loading, setLoading] = useState(false);
  const fetchData = useCallback(async () => {
    console.log('Fetch');
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/expense');
      console.log(res);
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SafeAreaView style={tailwind('h-full items-center bg-white')}>
      {notes === undefined && <span style={tailwind('bg-blue-100')}>Loading</span>}
      <ScrollView
        style={tailwind('w-full')}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} />
        }
      >
        <FlatList<Expense>
          style={tailwind('w-full')}
          renderItem={({ item }) => <ExpenseItem item={item} />}
          data={DATA}
          keyExtractor={(item) => item.id}
        />
      </ScrollView>
      <View style={tailwind('w-full flex items-end mb-3 mr-5')}>
        <AddExpenseButton navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};
