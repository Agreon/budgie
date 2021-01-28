import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Splash } from './src/screens/Splash';
import { Expenses } from './src/screens/Expenses';

const Stack = createStackNavigator();

export type RootStackParamList = {
  'Splash': undefined
  'Expenses': undefined
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
