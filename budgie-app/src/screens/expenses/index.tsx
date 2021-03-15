import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ExpenseList } from './ExpenseList';
import { CreateExpense } from './CreateExpense';
import { EditExpense } from './EditExpense';
import { Header } from '../../components/Header';
import { ReoccurringExpenseList } from './ReoccurringExpenseList';
import { CreateReoccurringExpense } from './CreateReoccurringExpense';

export type ExpensesStackParamList = {
  'Expenses': { screen: string },
  'CreateExpense': undefined,
  'EditExpense': { id: string }
  'CreateReoccurringExpense': undefined,
  'EditReoccurringExpense': { id: string }
};

const TabBar = createMaterialTopTabNavigator();

/**
 * TODO:
 * - OnBack in Forms: Expenses is always shown
 */
const ExpenseLists = () => (
  <>
    <Header title="Expenses" />
    <TabBar.Navigator
      style={{
        marginTop: -10,
      }}
    >
      <TabBar.Screen
        name="Single"
        component={ExpenseList}
      />
      <TabBar.Screen
        name="Reoccurring"
        component={ReoccurringExpenseList}
      />
    </TabBar.Navigator>
  </>
);

const { Navigator, Screen } = createStackNavigator();

export const Expenses = () => (
  <Navigator
    headerMode="none"
    initialRouteName="Expenses"
  >
    <Screen
      name="Expenses"
      component={ExpenseLists}
    />
    <Screen
      name="CreateExpense"
      component={CreateExpense}
    />
    <Screen
      name="EditExpense"
      component={EditExpense}
    />
    <Screen
      name="CreateReoccurringExpense"
      component={CreateReoccurringExpense}
    />
    <Screen
      name="EditReoccurringExpense"
      component={EditExpense}
    />
  </Navigator>
);
