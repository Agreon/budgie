import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import { SafeAreaView, View } from 'react-native';
import tailwind from 'tailwind-rn';
import {
  Button,
  Card,
  Icon,
  IconProps,
  Modal,
  Text,
  Spinner, TopNavigationAction,
} from '@ui-kitten/components';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../../App';
import { BackAction } from '../components/BackAction';
import { Header } from '../components/Header';
import { ExpenseForm } from '../components/ExpenseForm';
import { Expense } from '../util/types';
import { getToken } from '../util/token';

const DeleteIcon = (props: IconProps) => (
  <Icon {...props} name="trash-outline" />
);

const DeleteExpenseDialog: FC<{
  visible: boolean
  onSubmit: () => void
  onClose: () => void
}> = ({ visible, onSubmit, onClose }) => (
  <Modal
    visible={visible}
    backdropStyle={{
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    }}
  >
    <Card
      footer={(props) => (
        <View {...props} style={tailwind('flex-1 flex-row justify-end m-2')}>
          <Button
            size="small"
            status="basic"
            onPress={onClose}
            style={{ marginHorizontal: 2 }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            status="danger"
            onPress={onSubmit}
            style={{ marginHorizontal: 2 }}
          >
            Delete
          </Button>
        </View>
      )}
    >
      <Text>Are you sure you want to delete this Expense?</Text>
    </Card>
  </Modal>
);

export const EditExpense: FC<{
    route: RouteProp<RootStackParamList, 'EditExpense'>
    navigation: StackNavigationProp<RootStackParamList, 'EditExpense'>
}> = ({ navigation, route: { params: { id } } }) => {
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
        Toast.show({
          type: 'error',
          text1: err.message || 'Unknown error',
        });
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
      Toast.show({
        type: 'error',
        text1: err.message || 'Unknown error',
      });
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
      Toast.show({
        type: 'error',
        text1: err.message || 'Unknown error',
      });
    }
  }, [id]);

  return (
    <SafeAreaView style={tailwind('bg-white h-full w-full')}>
      <Header
        title="Edit Expense"
        accessoryLeft={() => <BackAction navigation={navigation} />}
        accessoryRight={() => (
          <TopNavigationAction
            icon={DeleteIcon}
            onPress={() => setDeleteDialogVisible(true)}
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
            <DeleteExpenseDialog
              visible={deleteDialogVisible}
              onClose={() => setDeleteDialogVisible(false)}
              onSubmit={onDelete}
            />
          </View>
        )
      }
    </SafeAreaView>
  );
};
