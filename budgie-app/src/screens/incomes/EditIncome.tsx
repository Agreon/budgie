import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import {
  Keyboard,
} from 'react-native';
import {
  Icon,
  TopNavigationAction,
} from '@ui-kitten/components';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useQueryClient } from 'react-query';
import { Income } from '../../util/types';
import { useToast } from '../../ToastProvider';
import { useApi } from '../../hooks/use-request';
import { IncomesStackParamList } from '.';
import { IncomeForm } from './IncomeForm';
import { Query } from '../../hooks/use-paginated-query';
import { DeleteDialog } from '../../components/DeleteDialog';
import { PageWrapper } from '../../components/PageWrapper';

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
        // TODO: Use react-query
        const { data } = await api.get(`income/${id}`);
        setIncome(data);
      } catch (err) {
        showToast({ status: 'danger', message: err.message || 'Unknown error' });
      }
    })();
  }, [id]);

  const onSave = useCallback(async (incomeData: Omit<Income, 'id'>) => {
    try {
      await api.put(`income/${id}`, incomeData);
      queryClient.resetQueries({ queryKey: Query.Incomes });
      navigation.goBack();
    } catch (err) {
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [id, api, navigation, showToast]);

  return (
    <PageWrapper
      title="Edit Income"
      loading={!income}
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
    >
      <IncomeForm
        income={income!}
        onSubmit={onSave}
      />
      <DeleteDialog
        deletePath={`income/${id}`}
        visible={deleteDialogVisible}
        content="Are you sure you want to delete this income?"
        onClose={() => setDeleteDialogVisible(false)}
        onDeleted={() => {
          queryClient.resetQueries({ queryKey: Query.Incomes });
          navigation.goBack();
        }}
      />
    </PageWrapper>
  );
};
