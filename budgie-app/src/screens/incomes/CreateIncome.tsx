import React, {
  FC, useCallback,
} from 'react';
import { View, ScrollView } from 'react-native';
import tailwind from 'tailwind-rn';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQueryClient } from 'react-query';
import { Header } from '../../components/Header';
import { BackAction } from '../../components/BackAction';
import { Income } from '../../util/types';
import { useToast } from '../../ToastProvider';
import { useApi } from '../../hooks/use-request';
import { IncomesStackParamList } from '.';
import { IncomeForm } from './IncomeForm';
import { Query } from '../../hooks/use-paginated-query';

export const CreateIncome: FC<{
    navigation: StackNavigationProp<IncomesStackParamList, 'CreateIncome'>
  }> = ({ navigation }) => {
    const api = useApi();
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const createIncome = useCallback(async (incomeData: Omit<Income, 'id'>) => {
      try {
        await api.post('income', incomeData);
        queryClient.resetQueries({ queryKey: Query.Incomes, exact: true });
        navigation.goBack();
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
          title="Create Income"
          accessoryLeft={() => <BackAction navigation={navigation} />}
        />
        <View style={tailwind('flex pl-5 pr-5')}>
          <IncomeForm
            onSubmit={createIncome}
          />
        </View>
      </ScrollView>
    );
  };
