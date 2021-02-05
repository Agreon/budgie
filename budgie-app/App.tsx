import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { Splash } from './src/screens/Splash';
import { Expenses } from './src/screens/Expenses';
import { CreateExpense } from './src/screens/CreateExpense';

const { Navigator, Screen } = createStackNavigator();

export type RootStackParamList = {
  'Splash': undefined
  'Expenses': undefined,
  'CreateExpense': undefined
};

export default function App() {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <NavigationContainer>
          <Navigator
            headerMode="none"
          >
            <Screen
              name="splash"
              component={Splash}
            />
            <Screen
              name="Expenses"
              component={Expenses}
            />
            <Screen
              name="CreateExpense"
              component={CreateExpense}
            />
          </Navigator>
        </NavigationContainer>
      </ApplicationProvider>
    </>
  );
}
