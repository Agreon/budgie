import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import { Expenses } from './src/screens/Expenses';
import { CreateExpense } from './src/screens/CreateExpense';
import { Login } from './src/screens/Login';
import { EditExpense } from './src/screens/EditExpense';

const { Navigator, Screen } = createStackNavigator();

export type RootStackParamList = {
  'Login': undefined,
  'Expenses': undefined,
  'CreateExpense': undefined,
  'EditExpense': {id: string}
};

export default function App() {
  useEffect(() => {
    (async () => {
      await SplashScreen.preventAutoHideAsync();
    })();
  }, []);

  return (
    <>
      <Toast ref={(ref) => Toast.setRef(ref)} style={{ zIndex: 2 }} />
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
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
      </ApplicationProvider>
    </>
  );
}
