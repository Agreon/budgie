import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { Expenses } from './ExpenseList';
import { CreateExpense } from './CreateExpense';
import { EditExpense } from './EditExpense';

const { Navigator, Screen } = createStackNavigator();

export type ExpensesStackParamList = {
    'Expenses': undefined,
    'CreateExpense': undefined,
    'EditExpense': { id: string }
};

export const ExpensesStack = () => (
  <Navigator
    headerMode="none"
  >
    <Screen
      name="Expenses"
      component={Expenses}
    />
    <Screen
      name="CreateExpense"
      component={CreateExpense}
    />
    <Screen
      name="EditExpense"
      component={EditExpense}
    />
  </Navigator>
);
