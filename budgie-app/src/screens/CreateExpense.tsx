import React, { FC, useCallback } from 'react';
import { View, SafeAreaView } from 'react-native';
import tailwind from 'tailwind-rn';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Header } from '../components/Header';
import { BackAction } from '../components/BackAction';
import { ExpenseForm } from '../components/ExpenseForm';
import { Expense } from '../util/types';
import { useToast } from '../ToastProvider';
import { useExpenses } from '../EntityProvider';
import { deleteToken } from '../util/token';

export const CreateExpense: FC<{
  navigation: StackNavigationProp<RootStackParamList, 'CreateExpense'>
}> = ({ navigation }) => {
  const { createExpense: create } = useExpenses();

  const { showToast } = useToast();

  const createExpense = useCallback(async (expenseData: Omit<Expense, 'id'>) => {
    try {
      await create(expenseData);
      navigation.goBack();
    } catch (err) {
      if (err.response?.status === 401) {
        await deleteToken();
        showToast({ status: 'danger', message: 'Please log in again' });

        navigation.navigate('Login');
        return;
      }
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [create, navigation, showToast]);

  return (
    <SafeAreaView style={tailwind('bg-white h-full w-full')}>
      <Header
        title="Create Expense"
        accessoryLeft={() => <BackAction navigation={navigation} />}
      />
      <View style={tailwind('flex pl-5 pr-5')}>
        <ExpenseForm
          onSubmit={createExpense}
        />
      </View>
    </SafeAreaView>
  );
};
