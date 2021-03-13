import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { IncomeList } from './IncomeList';
import { CreateIncome } from './CreateIncome';
import { EditIncome } from './EditIncome';

const { Navigator, Screen } = createStackNavigator();

export type IncomesStackParamList = {
    'Incomes': undefined,
    'CreateIncome': undefined,
    'EditIncome': { id: string }
};

export const Incomes = () => (
  <Navigator
    headerMode="none"
  >
    <Screen
      name="Incomes"
      component={IncomeList}
    />
    <Screen
      name="CreateIncome"
      component={CreateIncome}
    />
    <Screen
      name="EditIncome"
      component={EditIncome}
    />
  </Navigator>
);
