import React, { useCallback } from 'react';

import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Button, Icon } from '@ui-kitten/components';
import tailwind from 'tailwind-rn';
import {
  getFocusedRouteNameFromRoute, RouteProp,
} from '@react-navigation/native';
import { useQueryClient } from 'react-query';
import { IncomeList } from './IncomeList';
import { CreateIncome } from './CreateIncome';
import { EditIncome } from './EditIncome';
import { Header } from '../../components/Header';
import { ReoccurringIncomeList } from './ReoccurringIncomeList';
import { CreateReoccurring } from '../../components/reoccurring/CreateReoccurring';
import { EditReoccurring } from '../../components/reoccurring/EditReoccurring';
import { Query } from '../../hooks/use-paginated-query';
import { EditReoccurringHistoryItem } from '../../components/reoccurring/EditReoccurringHistoryItem';

const { Navigator, Screen } = createStackNavigator();

export type IncomesStackParamList = {
    'Incomes': undefined,
    'CreateIncome': undefined,
    'EditIncome': { id: string },
    'CreateReoccurringIncome': undefined,
    'EditReoccurringIncome': { id: string },
    'EditReoccurringHistoryItem': { id: string }
};

const TabBar = createMaterialTopTabNavigator();

const IncomeLists = ({ navigation, route }: {
  navigation: StackNavigationProp<IncomesStackParamList, 'Incomes'>
  route: RouteProp<IncomesStackParamList, 'Incomes'>
}) => (
  <>
    <Header title="Incomes" />
    <TabBar.Navigator
      style={{
        marginTop: -10,
      }}
    >
      <TabBar.Screen
        name="Single"
        component={IncomeList}
      />
      <TabBar.Screen
        name="Reoccurring"
        component={ReoccurringIncomeList}
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
          navigation.navigate('CreateIncome');
        } else {
          navigation.navigate('CreateReoccurringIncome');
        }
      }}
    />
  </>
);

export const Incomes = () => {
  const queryClient = useQueryClient();

  const onActionDone = useCallback((navigation) => {
    queryClient.resetQueries({ queryKey: Query.ReoccurringIncomes });
    queryClient.resetQueries({ queryKey: Query.Reoccurring });
    navigation.navigate('Incomes', { screen: 'Reoccurring' });
  }, [queryClient]);

  return (
    <Navigator
      headerMode="none"
    >
      <Screen
        name="Incomes"
        component={IncomeLists}
      />
      <Screen
        name="CreateIncome"
        component={CreateIncome}
      />
      <Screen
        name="EditIncome"
        component={EditIncome}
      />
      <Screen
        name="CreateReoccurringIncome"
      >
        {({ navigation }) => (
          <CreateReoccurring
            type="income"
            onActionDone={() => onActionDone(navigation)}
          />
        )}
      </Screen>
      <Screen
        name="EditReoccurringIncome"
      >
        {({ navigation }) => (
          <EditReoccurring
            type="income"
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
