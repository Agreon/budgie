import React, {
  FC, useCallback,
} from 'react';
import { View, ScrollView } from 'react-native';
import tailwind from 'tailwind-rn';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQueryClient } from 'react-query';
import { Header } from '../../components/Header';
import { BackAction } from '../../components/BackAction';
import { Reoccurring } from '../../util/types';
import { useToast } from '../../ToastProvider';
import { useApi } from '../../hooks/use-request';
import { ExpensesStackParamList } from '.';
import { Query } from '../../hooks/use-paginated-query';
import { ReoccurringForm } from '../../components/ReoccurringForm';

export const CreateReoccurringExpense: FC<{
  navigation: StackNavigationProp<ExpensesStackParamList, 'CreateReoccurringExpense'>
}> = ({ navigation }) => {
  const api = useApi();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const createReoccurringExpense = useCallback(async (expenseData: Omit<Reoccurring, 'id' | 'is_expense'>) => {
    try {
      await api.post('recurring', {
        ...expenseData,
        type: 'expense',
      });
      queryClient.resetQueries({ queryKey: Query.ReoccurringExpenses, exact: true });
      navigation.navigate('Expenses', { screen: 'Reoccurring' });
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [api, navigation, showToast]);

  return (
    <ScrollView
      stickyHeaderIndices={[0]}
      style={tailwind('bg-white h-full w-full')}
    >
      <Header
        title="Create Reoccurring Expense"
        accessoryLeft={() => <BackAction navigation={navigation} />}
      />
      <View style={tailwind('flex pl-5 pr-5')}>
        <ReoccurringForm
          onSubmit={createReoccurringExpense}
        />
      </View>
    </ScrollView>
  );
};
