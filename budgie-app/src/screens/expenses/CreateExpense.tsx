import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQueryClient } from 'react-query';
import { ExpenseForm } from './ExpenseForm';
import { Expense, Tag } from '../../util/types';
import { useToast } from '../../ToastProvider';
import { useApi } from '../../hooks/use-request';
import { ExpensesStackParamList } from '.';
import { Query } from '../../hooks/use-paginated-query';
import { PageWrapper } from '../../components/PageWrapper';

export const CreateExpense: FC<{
  navigation: StackNavigationProp<ExpensesStackParamList, 'CreateExpense'>
}> = ({ navigation }) => {
  const api = useApi();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [availableTags, setAvailableTags] = useState<Tag[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // TODO: Use react-query
        const { data: { data: tags } } = await api.get('tag?page=0');
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
      queryClient.resetQueries({ queryKey: Query.Expenses });
      navigation.goBack();
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [api, navigation, showToast]);

  return (
    <PageWrapper
      title="Create Expense"
      loading={availableTags === null}
    >
      <ExpenseForm
        availableTags={availableTags!}
        onSubmit={createExpense}
        setAvailableTags={setAvailableTags}
      />
    </PageWrapper>
  );
};
