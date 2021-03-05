import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import * as eva from '@eva-design/eva';
import {
  ApplicationProvider,
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  IconRegistry,
} from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as SplashScreen from 'expo-splash-screen';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Login } from './src/screens/Login';
import { ToastProvider } from './src/ToastProvider';
import { Tags } from './src/screens/Tags';
import { ExpensesStack } from './src/screens/expenses';

const { Navigator, Screen } = createBottomTabNavigator();

export type RootStackParamList = {
  'Login': undefined,
  'Expenses': undefined,
  'Tags': undefined,
};

// Show SplashScreen until login state is determined.
SplashScreen
  .preventAutoHideAsync()
  .catch((error) => console.error(error));

const BottomTabBar = ({ navigation, state }: BottomTabBarProps) => (
  <BottomNavigation
    selectedIndex={state.index}
    onSelect={index => navigation.navigate(state.routeNames[index])}
  >
    <BottomNavigationTab title="EXPENSES" icon={props => <Icon {...props} name="trending-down-outline" />} />
    <BottomNavigationTab title="TAGS" icon={props => <Icon {...props} name="pricetags-outline" />} />
  </BottomNavigation>
);

export default function App() {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <ToastProvider>
          <NavigationContainer>
            <Navigator
              initialRouteName="Expenses"
              backBehavior="history"
              tabBar={props => <BottomTabBar {...props} />}
            >
              <Screen
                name="Expenses"
                component={ExpensesStack}
              />
              <Screen
                name="Tags"
                component={Tags}
              />
              <Screen
                name="Login"
                component={Login}
              />
            </Navigator>
          </NavigationContainer>
        </ToastProvider>
      </ApplicationProvider>
    </>
  );
}
