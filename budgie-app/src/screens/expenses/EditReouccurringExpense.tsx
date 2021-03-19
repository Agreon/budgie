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
import { Reoccurring } from '../../util/types';
import { useToast } from '../../ToastProvider';
import { Dialog } from '../../components/Dialog';
import { useApi } from '../../hooks/use-request';
import { ExpensesStackParamList } from '.';
import { Query } from '../../hooks/use-paginated-query';
import { ReoccurringForm } from '../../components/ReoccurringForm';

// TODO: Just use this for income as well
export const EditReoccurringExpense: FC<{
    route: RouteProp<ExpensesStackParamList, 'EditReoccurringExpense'>
    navigation: StackNavigationProp<ExpensesStackParamList, 'EditReoccurringExpense'>
}> = ({ navigation, route: { params: { id } } }) => {
  const api = useApi();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [reoccurring, setReoccurring] = useState<Reoccurring | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { recurring } } = await api.get(`recurring/${id}`);
        setReoccurring(recurring);
      } catch (err) {
        showToast({ status: 'danger', message: err.message || 'Unknown error' });
      }
    })();
  }, [id]);

  const onSave = useCallback(async (expenseData: Omit<Reoccurring, 'id' | 'is_expense'>) => {
    try {
      await api.put(`recurring/${id}`, {
        ...expenseData,
        type: 'expense',
      });
      queryClient.resetQueries({ queryKey: Query.ReoccurringExpenses, exact: true });
      navigation.navigate('Expenses', { screen: 'Reoccurring' });
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [id, api, navigation, showToast]);

  const onDelete = useCallback(async () => {
    // TODO: Some kind of loading state would be nice.
    setDeleteDialogVisible(false);
    try {
      await api.delete(`recurring/${id}`);
      queryClient.resetQueries({ queryKey: Query.ReoccurringExpenses, exact: true });
      navigation.navigate('Expenses', { screen: 'Reoccurring' });
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [id, api, navigation, showToast]);

  return (
    <ScrollView
      stickyHeaderIndices={[0]}
      style={tailwind('bg-white h-full w-full')}
    >
      <Header
        title="Edit Reoccurring Expense"
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
        !reoccurring ? (
          <View style={tailwind('absolute w-full h-full flex items-center bg-gray-300 bg-opacity-25 justify-center z-10')}>
            <Spinner size="giant" />
          </View>
        ) : (
          <View style={tailwind('flex pl-5 pr-5')}>
            <ReoccurringForm
              reoccurring={reoccurring}
              onSubmit={onSave}
            />
            <Dialog
              visible={deleteDialogVisible}
              content="Are you sure you want to delete this reoccurring expense?"
              onClose={() => setDeleteDialogVisible(false)}
              onSubmit={onDelete}
            />
          </View>
        )
      }
    </ScrollView>
  );
};
