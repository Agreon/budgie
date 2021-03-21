import React, { useCallback } from 'react';

import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Button, Icon } from '@ui-kitten/components';
import tailwind from 'tailwind-rn';
import {
  getFocusedRouteNameFromRoute, RouteProp,
} from '@react-navigation/native';
import { IncomeList } from './IncomeList';
import { CreateIncome } from './CreateIncome';
import { EditIncome } from './EditIncome';
import { Header } from '../../components/Header';
import { ReoccurringIncomeList } from './ReoccurringIncomeList';
import { CreateReoccurring } from '../../components/CreateReoccurring';
import { EditReoccurring } from '../../components/EditReoccurring';
import { Query } from '../../hooks/use-paginated-query';

const { Navigator, Screen } = createStackNavigator();

export type IncomesStackParamList = {
    'Incomes': undefined,
    'CreateIncome': undefined,
    'EditIncome': { id: string },
    'CreateReoccurringIncome': undefined,
    'EditReoccurringIncome': { id: string }
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
  const onActionDone = useCallback((queryClient, navigation) => {
    queryClient.resetQueries({ queryKey: Query.ReoccurringIncomes, exact: true });
    navigation.navigate('Incomes', { screen: 'Reoccurring' });
  }, []);

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
        {() => (
          <CreateReoccurring
            type="income"
            onActionDone={onActionDone}
          />
        )}
      </Screen>
      <Screen
        name="EditReoccurringIncome"
      >
        {() => (
          <EditReoccurring
            type="income"
            onActionDone={onActionDone}
          />
        )}
      </Screen>
    </Navigator>
  );
};
