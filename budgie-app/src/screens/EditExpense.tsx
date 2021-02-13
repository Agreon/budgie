import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import { SafeAreaView, View } from 'react-native';
import tailwind from 'tailwind-rn';
import {
  Spinner,
} from '@ui-kitten/components';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { RootStackParamList } from '../../App';
import { BackAction } from '../components/BackAction';
import { Header } from '../components/Header';
import { ExpenseForm } from '../components/ExpenseForm';
import { Expense } from '../util/types';
import { getToken } from '../util/token';

export const EditExpense: FC<{
    route: RouteProp<RootStackParamList, 'EditExpense'>
    navigation: StackNavigationProp<RootStackParamList, 'EditExpense'>
}> = ({ navigation, route: { params: { id } } }) => {
  const [expense, setExpense] = useState<Expense | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`http://localhost:8080/expense/${id}`, {
          headers: {
            token: await getToken(),
          },
        });
        setExpense(res.data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [id]);

  const onSave = useCallback(async (expenseData: Omit<Expense, 'id'>) => {
    try {
      await axios.put(`http://localhost:8080/expense/${id}`, expenseData, {
        headers: {
          token: await getToken(),
        },
      });
      navigation.navigate('Expenses');
    } catch (e) {
      console.error(e);
    }
  }, [id]);

  // TODO: Header accessory right => Delete btn?
  return (
    <SafeAreaView style={tailwind('bg-white h-full w-full')}>
      <Header
        title="Edit Expense"
        accessoryLeft={() => <BackAction navigation={navigation} />}
      />
      {
                !expense ? (
                  <View style={tailwind('absolute w-full h-full flex items-center bg-gray-300 bg-opacity-25 justify-center z-10')}>
                    <Spinner size="giant" />
                  </View>
                ) : (
                  <View style={tailwind('flex pl-5 pr-5')}>
                    <ExpenseForm
                      expense={expense}
                      onSubmit={onSave}
                    />
                  </View>
                )
            }
    </SafeAreaView>
  );
};
