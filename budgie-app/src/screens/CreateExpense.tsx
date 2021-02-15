import React, { FC, useCallback } from 'react';
import { View, SafeAreaView } from 'react-native';
import tailwind from 'tailwind-rn';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../../App';
import { Header } from '../components/Header';
import { BackAction } from '../components/BackAction';
import { ExpenseForm } from '../components/ExpenseForm';
import { Expense } from '../util/types';
import { getToken } from '../util/token';

export const CreateExpense: FC<{
  navigation: StackNavigationProp<RootStackParamList, 'CreateExpense'>
}> = ({ navigation }) => {
  const createExpense = useCallback(async (expenseData: Omit<Expense, 'id'>) => {
    try {
      await axios.post('http://localhost:8080/expense', expenseData, {
        headers: {
          token: await getToken(),
        },
      });

      navigation.goBack();
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: err.message || 'Unknown error',
      });
    }
  }, [navigation]);

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
