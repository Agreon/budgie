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
import { useApi } from '../hooks/use-request';

export const CreateExpense: FC<{
  navigation: StackNavigationProp<RootStackParamList, 'CreateExpense'>
}> = ({ navigation }) => {
  const api = useApi(navigation);
  const { showToast } = useToast();

  const createExpense = useCallback(async (expenseData: Omit<Expense, 'id'>) => {
    try {
      await api.post('expense', expenseData);
      navigation.goBack();
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [api, navigation, showToast]);

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
