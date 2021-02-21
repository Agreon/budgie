import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as SplashScreen from 'expo-splash-screen';
import { Expenses } from './src/screens/Expenses';
import { CreateExpense } from './src/screens/CreateExpense';
import { Login } from './src/screens/Login';
import { EditExpense } from './src/screens/EditExpense';
import { ToastProvider } from './src/ToastProvider';

const { Navigator, Screen } = createStackNavigator();

export type RootStackParamList = {
  'Login': undefined,
  'Expenses': undefined,
  'CreateExpense': undefined,
  'EditExpense': { id: string }
};

SplashScreen.preventAutoHideAsync().then(() => console.log('prevented')).catch((error) => console.error(error));

export default function App() {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <ToastProvider>
          <NavigationContainer>
            <Navigator
              headerMode="none"
            >
              <Screen
                name="Login"
                component={Login}
              />
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
          </NavigationContainer>
        </ToastProvider>
      </ApplicationProvider>
    </>
  );
}
