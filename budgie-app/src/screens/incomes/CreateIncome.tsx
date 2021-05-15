import React, {
  FC, useCallback,
} from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQueryClient } from 'react-query';
import { Income } from '../../util/types';
import { useToast } from '../../ToastProvider';
import { useApi } from '../../hooks/use-request';
import { IncomesStackParamList } from '.';
import { IncomeForm } from './IncomeForm';
import { Query } from '../../hooks/use-paginated-query';
import { PageWrapper } from '../../components/PageWrapper';

export const CreateIncome: FC<{
    navigation: StackNavigationProp<IncomesStackParamList, 'CreateIncome'>
  }> = ({ navigation }) => {
    const api = useApi();
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const createIncome = useCallback(async (incomeData: Omit<Income, 'id'>) => {
      try {
        await api.post('income', incomeData);
        queryClient.resetQueries({ queryKey: Query.Incomes });
        navigation.goBack();
      } catch (err) {
        showToast({ status: 'danger', message: err.message || 'Unknown error' });
      }
    }, [api, navigation, showToast]);

    return (
      <PageWrapper title="Create Income">
        <IncomeForm
          onSubmit={createIncome}
        />
      </PageWrapper>
    );
  };
