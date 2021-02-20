import { StackNavigationProp } from '@react-navigation/stack';
import {
  Button, Input,
} from '@ui-kitten/components';
import axios from 'axios';
import React, {
  FC, useCallback, useState,
} from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tailwind from 'tailwind-rn';
import { RootStackParamList } from '../../App';
import { Header } from '../components/Header';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { setToken } from '../util/token';
import { useToast } from '../ToastProvider';
import { PasswordInput } from '../components/PasswordInput';
import { BackAction } from '../components/BackAction';

export const Register: FC<{
  navigation: StackNavigationProp<RootStackParamList, 'Register'>
}> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const registerUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { token } } = await axios.post('http://localhost:8080/user', {
        username,
        password,
      });

      await setToken(token);
      navigation.navigate('Expenses');
    } catch (err) {
      console.error(err);
      showToast({ message: 'Register failed', status: 'danger' });
    }
    setLoading(false);
  }, [username, password, navigation]);

  return (
    <SafeAreaView style={tailwind('bg-white h-full w-full')}>
      <Header
        title="Register"
        accessoryLeft={() => <BackAction navigation={navigation} />}
      />
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
          onSubmitEditing={registerUser}
          label="Password"
        />
        <Button
          style={tailwind('mt-8')}
          disabled={loading}
          onPress={registerUser}
          accessoryLeft={loading ? LoadingIndicator : undefined}
        >
          Register
        </Button>
      </View>
    </SafeAreaView>
  );
};
