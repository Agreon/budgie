import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import { View, SafeAreaView } from 'react-native';
import tailwind from 'tailwind-rn';
import { StackNavigationProp } from '@react-navigation/stack';
import { Spinner } from '@ui-kitten/components';
import { Header } from '../../components/Header';
import { BackAction } from '../../components/BackAction';
import { ExpenseForm } from './ExpenseForm';
import { Expense, Tag } from '../../util/types';
import { useToast } from '../../ToastProvider';
import { useApi } from '../../hooks/use-request';
import { ExpensesStackParamList } from '.';

export const CreateExpense: FC<{
  navigation: StackNavigationProp<ExpensesStackParamList, 'CreateExpense'>
}> = ({ navigation }) => {
  const api = useApi();
  const { showToast } = useToast();

  const [availableTags, setAvailableTags] = useState<Tag[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: tags } = await api.get('tag');
        setAvailableTags(tags);
      } catch (err) {
        showToast({ status: 'danger', message: err.message || 'Unknown error' });
      }
    })();
  }, []);

  const createExpense = useCallback(async (expenseData: Omit<Expense, 'id'>) => {
    try {
      await api.post('expense', {
        ...expenseData,
        tag_ids: expenseData.tags?.map(t => t.id) || [],
      });
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
      {
        availableTags === null ? (
          <View style={tailwind('absolute w-full h-full flex items-center bg-gray-300 bg-opacity-25 justify-center z-10')}>
            <Spinner size="giant" />
          </View>
        ) : (
          <View style={tailwind('flex pl-5 pr-5')}>
            <ExpenseForm
              availableTags={availableTags}
              onSubmit={createExpense}
              setAvailableTags={setAvailableTags}
            />
          </View>
        )
      }
    </SafeAreaView>
  );
};
