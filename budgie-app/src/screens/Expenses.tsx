import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import axios from 'axios';

import {
  View, SafeAreaView, FlatList,
} from 'react-native';

import tailwind from 'tailwind-rn';

// TODO: Move to common lib? => converter https://github.com/tkrajina/typescriptify-golang-structs
interface Expense {
  id: string;
  name: string;
  createdAt: Date;
}

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    name: 'First Item',
    createdAt: new Date(),
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    name: 'Second Item',
    createdAt: new Date(),
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    name: 'Third Item',
    createdAt: new Date(),
  },
];

export const ExpenseItem: FC<{ item: Expense }> = ({ item }) => (
  <div style={tailwind('p-6 m-1 w-screen shadow-lg bg-white flex items-center')}>
    <div>{item.name}</div>
    <div>{item.createdAt.getTime()}</div>
    <div>...</div>
  </div>
);

export const AddExpenseButton: FC = () => (
  <div style={tailwind('m-1 shadow-lg rounded-full bg-red-900')}>+-</div>
);

export const Expenses = () => {
  const [notes] = useState<Expense[] | undefined>([]);

  const fetchData = useCallback(async () => {
    console.log('Fetch');
    try {
      const res = await axios.get('http://localhost:8080/ping');
      console.log(res);
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SafeAreaView style={tailwind('h-full items-center bg-gray-200')}>
      {notes === undefined && <span style={tailwind('bg-blue-100')}>Loading</span>}
      <FlatList<Expense>
        renderItem={({ item }) => <ExpenseItem item={item} />}
        data={DATA}
        keyExtractor={(item) => item.id}
      />
      <View style={tailwind('flex')}>
        <AddExpenseButton />
      </View>
    </SafeAreaView>
  );
};
