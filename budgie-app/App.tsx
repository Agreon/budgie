import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as eva from '@eva-design/eva';
import {
  ApplicationProvider,
  BottomNavigation,
  BottomNavigationTab,
  Drawer,
  DrawerItem,
  IconRegistry,
  IndexPath,
} from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as SplashScreen from 'expo-splash-screen';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import tailwind from 'tailwind-rn';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Expenses } from './src/screens/Expenses';
import { CreateExpense } from './src/screens/CreateExpense';
import { Login } from './src/screens/Login';
import { EditExpense } from './src/screens/EditExpense';
import { ToastProvider } from './src/ToastProvider';
import { Tags } from './src/screens/Tags';

const Stack = createStackNavigator();
const { Navigator, Screen } = createBottomTabNavigator();

// TODO: Split this up
export type RootStackParamList = {
  'Login': undefined,
  'Expenses': undefined,
  'CreateExpense': undefined,
  'EditExpense': { id: string }
};

const ExpensesStack = () => (
  <Stack.Navigator
    headerMode="none"
  >
    <Stack.Screen
      name="Expenses"
      component={Expenses}
    />
    <Stack.Screen
      name="CreateExpense"
      component={CreateExpense}
    />
    <Stack.Screen
      name="EditExpense"
      component={EditExpense}
    />
  </Stack.Navigator>
);

SplashScreen.preventAutoHideAsync().then(() => console.log('prevented')).catch((error) => console.error(error));

/**
 * TODO: Add icons, beautify
 */
const DrawerContent = ({ navigation, state }: DrawerContentComponentProps) => (
  <Drawer
    selectedIndex={new IndexPath(state.index)}
    onSelect={index => navigation.navigate(state.routeNames[index.row])}
    style={tailwind('mt-10')}
  >
    <DrawerItem title="Expenses" />
    <DrawerItem title="Tags" />
  </Drawer>
);

const BottomTabBar = ({ navigation, state }: BottomTabBarProps) => (
  <BottomNavigation
    selectedIndex={state.index}
    onSelect={index => navigation.navigate(state.routeNames[index])}
  >
    <BottomNavigationTab title="Expenses" />
    <BottomNavigationTab title="Tags" />
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
