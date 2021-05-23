import React, { useCallback } from 'react';

import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { getFocusedRouteNameFromRoute, RouteProp } from '@react-navigation/native';
import { Button, Icon } from '@ui-kitten/components';
import tailwind from 'tailwind-rn';
import { useQueryClient } from 'react-query';
import { ExpenseList } from './ExpenseList';
import { CreateExpense } from './CreateExpense';
import { EditExpense } from './EditExpense';
import { Header } from '../../components/Header';
import { ReoccurringExpenseList } from './ReoccurringExpenseList';
import { Query } from '../../hooks/use-paginated-query';
import { CreateReoccurring } from '../../components/reoccurring/CreateReoccurring';
import { EditReoccurring } from '../../components/reoccurring/EditReoccurring';
import { EditReoccurringHistoryItem } from '../../components/reoccurring/EditReoccurringHistoryItem';

export type ExpensesStackParamList = {
  'Expenses': { screen: string },
  'CreateExpense': undefined,
  'EditExpense': { id: string }
  'CreateReoccurringExpense': undefined,
  'EditReoccurringExpense': { id: string }
  'EditReoccurringHistoryItem': { id: string }
};

const TabBar = createMaterialTopTabNavigator();

const ExpenseLists = ({ navigation, route }: {
  navigation: StackNavigationProp<ExpensesStackParamList, 'Expenses'>
  route: RouteProp<ExpensesStackParamList, 'Expenses'>
}) => (
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
    <Button
      style={tailwind('absolute right-6 bottom-5')}
      status="info"
      accessoryLeft={props => (
        <Icon {...props} name="plus-outline" />
      )}
      onPress={() => {
        const currentRoute = getFocusedRouteNameFromRoute(route) || 'Single';

        if (currentRoute === 'Single') {
          navigation.navigate('CreateExpense');
        } else {
          navigation.navigate('CreateReoccurringExpense');
        }
      }}
    />
  </>
);

const { Navigator, Screen } = createStackNavigator();

export const Expenses = () => {
  const queryClient = useQueryClient();

  const onActionDone = useCallback((navigation) => {
    queryClient.resetQueries({ queryKey: Query.ReoccurringExpenses });
    queryClient.resetQueries({ queryKey: Query.Reoccurring });
    navigation.navigate('Expenses', { screen: 'Reoccurring' });
  }, [queryClient]);

  return (
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
      >
        {({ navigation }) => (
          <CreateReoccurring
            type="expense"
            onActionDone={() => onActionDone(navigation)}
          />
        )}
      </Screen>
      <Screen
        name="EditReoccurringExpense"
      >
        {({ navigation }) => (
          <EditReoccurring
            type="expense"
            onActionDone={() => onActionDone(navigation)}
          />
        )}
      </Screen>
      <Screen
        name="EditReoccurringHistoryItem"
        component={EditReoccurringHistoryItem}
      />
    </Navigator>
  );
};
