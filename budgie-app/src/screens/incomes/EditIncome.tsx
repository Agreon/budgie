import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import {
  Keyboard, ScrollView, View,
} from 'react-native';
import tailwind from 'tailwind-rn';
import {
  Icon,
  IconProps,
  Spinner, TopNavigationAction,
} from '@ui-kitten/components';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useQueryClient } from 'react-query';
import { BackAction } from '../../components/BackAction';
import { Header } from '../../components/Header';
import { Income } from '../../util/types';
import { useToast } from '../../ToastProvider';
import { Dialog } from '../../components/Dialog';
import { useApi } from '../../hooks/use-request';
import { IncomesStackParamList } from '.';
import { IncomeForm } from './IncomeForm';
import { Query } from '../../hooks/use-paginated-query';

export const EditIncome: FC<{
    route: RouteProp<IncomesStackParamList, 'EditIncome'>
    navigation: StackNavigationProp<IncomesStackParamList, 'EditIncome'>
}> = ({ navigation, route: { params: { id } } }) => {
  const api = useApi();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [income, setIncome] = useState<Income | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`income/${id}`);
        setIncome(data);
      } catch (err) {
        showToast({ status: 'danger', message: err.message || 'Unknown error' });
      }
    })();
  }, [id]);

  const onSave = useCallback(async (incomeData: Omit<Income, 'id'>) => {
    try {
      console.log(incomeData);
      await api.put(`income/${id}`, incomeData);
      queryClient.resetQueries({ queryKey: Query.Incomes, exact: true });
      navigation.goBack();
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [id, api, navigation, showToast]);

  const onDelete = useCallback(async () => {
    // TODO: Some kind of loading state would be nice.
    setDeleteDialogVisible(false);
    try {
      await api.delete(`income/${id}`);
      queryClient.resetQueries({ queryKey: Query.Incomes, exact: true });
      navigation.goBack();
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [id, api, navigation, showToast]);

  return (
    <ScrollView
      stickyHeaderIndices={[0]}
      style={tailwind('bg-white h-full w-full')}
      contentContainerStyle={tailwind('h-full')}
    >
      <Header
        title="Edit Income"
        accessoryLeft={() => <BackAction navigation={navigation} />}
        accessoryRight={() => (
          <TopNavigationAction
            icon={(props: IconProps) => (
              <Icon {...props} name="trash-2-outline" />
            )}
            onPress={() => {
              Keyboard.dismiss();
              setDeleteDialogVisible(true);
            }}
          />
        )}
      />
      {
        !income ? (
          <View style={tailwind('absolute w-full h-full flex items-center bg-gray-300 bg-opacity-25 justify-center z-10')}>
            <Spinner size="giant" />
          </View>
        ) : (
          <View style={tailwind('flex pl-5 pr-5')}>
            <IncomeForm
              income={income}
              onSubmit={onSave}
            />
            <Dialog
              visible={deleteDialogVisible}
              content="Are you sure you want to delete this income?"
              onClose={() => setDeleteDialogVisible(false)}
              onSubmit={onDelete}
            />
          </View>
        )
      }
    </ScrollView>
  );
};
