import { StackNavigationProp } from '@react-navigation/stack';
import {
  Button, Icon, IconProps, Input,
} from '@ui-kitten/components';
import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tailwind from 'tailwind-rn';
import * as SplashScreen from 'expo-splash-screen';
import { RootStackParamList } from '../../App';
import { Header } from '../components/Header';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { setToken, getToken } from '../util/token';
import { useToast } from '../ToastProvider';
import { useApi } from '../hooks/use-request';

/**
 * TODO:
 * Splash Screen is hidden too early
 */
export const Login: FC<{
  navigation: StackNavigationProp<RootStackParamList, 'Login'>
}> = ({ navigation }) => {
  const api = useApi();
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const loginUser = useCallback(async () => {
    setLoading(true);
    Keyboard.dismiss();
    try {
      const res = await api.post('login', { username, password });

      await setToken(res.data.token);
      navigation.navigate('Expenses');
    } catch (err) {
      showToast({ message: 'Login failed', status: 'danger' });
    }
    setLoading(false);
  }, [username, password, navigation, showToast]);

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

  const renderIcon = (props: IconProps) => (
    <TouchableWithoutFeedback onPress={() => setSecureTextEntry(!secureTextEntry)}>
      <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );

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
        <Input
          style={tailwind('mt-4')}
          value={password}
          onChangeText={(text) => setPassword(text)}
          accessoryRight={renderIcon}
          secureTextEntry={secureTextEntry}
          onSubmitEditing={loginUser}
          label="Password"
        />
        <Button
          style={tailwind('mt-8')}
          disabled={loading}
          onPress={loginUser}
          accessoryLeft={loading ? LoadingIndicator : undefined}
        >
          Submit
        </Button>
      </View>
    </SafeAreaView>
  );
};
