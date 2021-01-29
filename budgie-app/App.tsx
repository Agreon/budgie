import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Splash } from './src/screens/Splash';
import { Expenses } from './src/screens/Expenses';
import { CreateExpense } from './src/screens/CreateExpense';

const Stack = createStackNavigator();

export type RootStackParamList = {
  'Splash': undefined
  'Expenses': undefined,
  'CreateExpense': undefined
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTitleStyle: {
            textAlign: 'center',
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="splash"
          component={Splash}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Expenses"
          component={Expenses}
        />
        <Stack.Screen
          name="CreateExpense"
          options={{
            title: 'Create Expense',
          }}
          component={CreateExpense}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
