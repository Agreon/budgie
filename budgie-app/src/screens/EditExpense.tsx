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
import axios from 'axios';
import { RootStackParamList } from '../../App';
import { BackAction } from '../components/BackAction';
import { Header } from '../components/Header';
import { ExpenseForm } from '../components/ExpenseForm';
import { Expense } from '../util/types';
import { getToken } from '../util/token';
import { useToast } from '../ToastProvider';
import { Dialog } from '../components/Dialog';

const DeleteIcon = (props: IconProps) => (
  <Icon {...props} name="trash-outline" />
);

export const EditExpense: FC<{
    route: RouteProp<RootStackParamList, 'EditExpense'>
    navigation: StackNavigationProp<RootStackParamList, 'EditExpense'>
}> = ({ navigation, route: { params: { id } } }) => {
  const { showToast } = useToast();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`http://localhost:8080/expense/${id}`, {
          headers: {
            token: await getToken(),
          },
        });
        setExpense(res.data);
      } catch (err) {
        console.error(err);
        showToast({ status: 'danger', message: err.message || 'Unknown error' });
      }
    })();
  }, [id]);

  const onSave = useCallback(async (expenseData: Omit<Expense, 'id'>) => {
    try {
      await axios.put(`http://localhost:8080/expense/${id}`, expenseData, {
        headers: {
          token: await getToken(),
        },
      });
      navigation.navigate('Expenses');
    } catch (err) {
      console.error(err);
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [id]);

  const onDelete = useCallback(async () => {
    // TODO: Some kind of loading state would be nice.
    setDeleteDialogVisible(false);
    try {
      await axios.delete(`http://localhost:8080/expense/${id}`, {
        headers: {
          token: await getToken(),
        },
      });
      navigation.navigate('Expenses');
    } catch (err) {
      console.error(err);
      showToast({ status: 'danger', message: err.message || 'Unknown error' });
    }
  }, [id]);

  return (
    <ScrollView style={tailwind('bg-white h-full w-full')}>
      <Header
        title="Edit Expense"
        accessoryLeft={() => <BackAction navigation={navigation} />}
        accessoryRight={() => (
          <TopNavigationAction
            icon={DeleteIcon}
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
              onSubmit={onSave}
            />
            <Dialog
              visible={deleteDialogVisible}
              text="Are you sure you want to delete this expense?"
              onClose={() => setDeleteDialogVisible(false)}
              onSubmit={onDelete}
            />
          </View>
        )
      }
    </ScrollView>
  );
};
