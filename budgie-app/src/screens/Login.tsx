import { StackNavigationProp } from '@react-navigation/stack';
import {
  Button, Input,
} from '@ui-kitten/components';
import axios from 'axios';
import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tailwind from 'tailwind-rn';
import * as SplashScreen from 'expo-splash-screen';
import { RootStackParamList } from '../../App';
import { Header } from '../components/Header';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { setToken, getToken } from '../util/token';
import { useToast } from '../ToastProvider';
import { PasswordInput } from '../components/PasswordInput';

/**
 * TODO:
 * Show splash screen until we know if a login is necessary
 *  - https://docs.expo.io/versions/latest/sdk/splash-screen/
 *
 * - global axios redirect 403 handler
 */
export const Login: FC<{
  navigation: StackNavigationProp<RootStackParamList, 'Login'>
}> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const loginUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { token } } = await axios.post('http://localhost:8080/login', {
        username,
        password,
      });

      await setToken(token);
      navigation.navigate('Expenses');
    } catch (err) {
      console.error(err);
      showToast({ message: 'Login failed', status: 'danger' });
    }
    setLoading(false);
  }, [username, password, navigation]);

  // Check for existing token on load.
  useEffect(() => {
    (async () => {
      const existingToken = await getToken();

      // TODO: Also check for expiry
      if (!existingToken) {
        await SplashScreen.hideAsync();
        return;
      }

      navigation.navigate('Expenses');
    })();
  }, []);

  return (
    <SafeAreaView style={tailwind('bg-white h-full w-full')}>
      <Header title="Login" />
      <View style={tailwind('flex pl-5 pr-5')}>
        <Input
          style={tailwind('mt-4')}
          value={username}
          onChangeText={(text) => setUsername(text)}
          label="Username"
        />
        <PasswordInput
          style={tailwind('mt-4')}
          value={password}
          onChangeText={(text) => setPassword(text)}
          onSubmitEditing={loginUser}
          label="Password"
        />
        <Button
          style={tailwind('mt-8')}
          disabled={loading}
          onPress={loginUser}
          accessoryLeft={loading ? LoadingIndicator : undefined}
        >
          Login
        </Button>
        <Button
          style={tailwind('mt-3')}
          onPress={() => navigation.navigate('Register')}
          status="basic"
          disabled={loading}
        >
          Register
        </Button>

      </View>
    </SafeAreaView>
  );
};
