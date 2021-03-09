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
import { createStackNavigator } from '@react-navigation/stack';
import { Login } from './src/screens/Login';
import { ToastProvider } from './src/ToastProvider';
import { Tags } from './src/screens/Tags';
import { Expenses } from './src/screens/expenses';
import { Incomes } from './src/screens/incomes';

const { Navigator, Screen } = createBottomTabNavigator();

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
    <BottomNavigationTab title="INCOMES" icon={props => <Icon {...props} name="trending-up-outline" />} />
    <BottomNavigationTab title="TAGS" icon={props => <Icon {...props} name="pricetags-outline" />} />
  </BottomNavigation>
);

export type MainParamList = {
  'Expenses': undefined,
  'Incomes': undefined,
  'Tags': undefined,
};

export const AppNavigator = () => (
  <Navigator
    initialRouteName="Expenses"
    backBehavior="history"
    tabBar={props => <BottomTabBar {...props} />}
  >
    <Screen
      name="Expenses"
      component={Expenses}
    />
    <Screen
      name="Incomes"
      component={Incomes}
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
);

const Main = createStackNavigator();

export type RootStackParamList = {
  'Login': undefined,
  'App': undefined,
};

export default function App() {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <ToastProvider>
          <NavigationContainer>
            <Main.Navigator initialRouteName="Login" headerMode="none">
              <Main.Screen
                name="Login"
                component={Login}
              />
              <Main.Screen
                name="App"
                component={AppNavigator}
              />
            </Main.Navigator>
          </NavigationContainer>
        </ToastProvider>
      </ApplicationProvider>
    </>
  );
}
