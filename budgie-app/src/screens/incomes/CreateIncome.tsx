import React, {
  FC, useCallback,
} from 'react';
import { View, SafeAreaView } from 'react-native';
import tailwind from 'tailwind-rn';
import { StackNavigationProp } from '@react-navigation/stack';
import { Header } from '../../components/Header';
import { BackAction } from '../../components/BackAction';
import { Income } from '../../util/types';
import { useToast } from '../../ToastProvider';
import { useApi } from '../../hooks/use-request';
import { IncomesStackParamList } from '.';
import { IncomeForm } from './IncomeForm';

export const CreateIncome: FC<{
    navigation: StackNavigationProp<IncomesStackParamList, 'CreateIncome'>
  }> = ({ navigation }) => {
    const api = useApi();
    const { showToast } = useToast();

    const createIncome = useCallback(async (incomeData: Omit<Income, 'id'>) => {
      try {
        await api.post('income', incomeData);
        navigation.goBack();
      } catch (err) {
        showToast({ status: 'danger', message: err.message || 'Unknown error' });
      }
    }, [api, navigation, showToast]);

    return (
      <SafeAreaView style={tailwind('bg-white h-full w-full')}>
        <Header
          title="Create Income"
          accessoryLeft={() => <BackAction navigation={navigation} />}
        />
        <View style={tailwind('flex pl-5 pr-5')}>
          <IncomeForm
            onSubmit={createIncome}
          />
        </View>
      </SafeAreaView>
    );
  };
