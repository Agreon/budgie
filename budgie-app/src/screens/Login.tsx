import { StackNavigationProp } from '@react-navigation/stack';
import {
  Button, Icon, IconProps, Input,
} from '@ui-kitten/components';
import axios from 'axios';
import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tailwind from 'tailwind-rn';
import * as SplashScreen from 'expo-splash-screen';
import { RootStackParamList } from '../../App';
import { Header } from '../components/Header';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { setToken, getToken } from '../util/token';

/**
 * TODO:
 * - error display
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
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const loginUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8080/login', {
        username,
        password,
      });

      await setToken(res.data.token);
      navigation.navigate('Expenses');
    } catch (e) {
      console.error(e);
    }
    //
    navigation.navigate('Expenses');

    setLoading(false);
  }, [username, password, navigation]);

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

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const renderIcon = (props: IconProps) => (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
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
