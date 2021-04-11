import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import {
  Keyboard, ScrollView, View,
} from 'react-native';
import tailwind from 'tailwind-rn';
import {
  Icon,
  Spinner,
  TopNavigationAction,
} from '@ui-kitten/components';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useQueryClient } from 'react-query';
import { BackAction } from '../../components/BackAction';
import { Header } from '../../components/Header';
import { ExpenseForm } from './ExpenseForm';
import { Expense, Tag } from '../../util/types';
import { useToast } from '../../ToastProvider';
import { useApi } from '../../hooks/use-request';
import { ExpensesStackParamList } from '.';
import { Query } from '../../hooks/use-paginated-query';
import { DeleteDialog } from '../../components/DeleteDialog';

export const EditExpense: FC<{
    route: RouteProp<ExpensesStackParamList, 'EditExpense'>
    navigation: StackNavigationProp<ExpensesStackParamList, 'EditExpense'>
}> = ({ navigation, route: { params: { id } } }) => {
  const api = useApi();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // TODO: Use react-query
        const { data } = await api.get(`expense/${id}`);
        const { data: tags } = await api.get('tag?page=0');
        setExpense(data);
        setAvailableTags(tags);
      } catch (err) {
        showToast({ status: 'danger', message: err.message || 'Unknown error' });
      }
    })();
  }, [id]);

  const onSave = useCallback(async (expenseData: Omit<Expense, 'id'>) => {
    try {
      await api.put(`expense/${id}`, {
        ...expenseData,
        tag_ids: expenseData.tags?.map(t => t.id) || [],
      });
      queryClient.resetQueries({ queryKey: Query.Expenses, exact: true });
      navigation.goBack();
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
        title="Edit Expense"
        accessoryLeft={props => <BackAction {...props} />}
        accessoryRight={props => (
          <TopNavigationAction
            {...props}
            icon={iconProps => (
              <Icon {...iconProps} name="trash-2-outline" />
            )}
            onPress={() => {
              Keyboard.dismiss();
              setDeleteDialogVisible(true);
            }}
          />
        )}
      />
      {
        !expense ? (
          <View style={tailwind('absolute w-full h-full flex items-center bg-gray-300 bg-opacity-25 justify-center z-10')}>
            <Spinner size="giant" />
          </View>
        ) : (
          <View style={tailwind('flex pl-5 pr-5')}>
            <ExpenseForm
              expense={expense}
              availableTags={availableTags}
              onSubmit={onSave}
              setAvailableTags={setAvailableTags}
            />
            <DeleteDialog
              deletePath={`expense/${id}`}
              visible={deleteDialogVisible}
              content="Are you sure you want to delete this expense?"
              onClose={() => setDeleteDialogVisible(false)}
              onDeleted={() => {
                queryClient.resetQueries({ queryKey: Query.Expenses, exact: true });
                navigation.goBack();
              }}
            />
          </View>
        )
      }
    </ScrollView>
  );
};
