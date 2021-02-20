import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { useMemo } from 'react';
import { RootStackParamList } from '../../App';
import { useToast } from '../ToastProvider';
import { deleteToken, getToken } from '../util/token';

export const useApi = (
  navigation: StackNavigationProp<RootStackParamList, keyof RootStackParamList>,
) => {
  const { showToast } = useToast();

  const api = useMemo(() => {
    const client = axios.create({
      baseURL: 'http://localhost:8080',
    });

    client.interceptors.request.use(async (config) => {
      if (config.url === '/login') {
        return config;
      }

      return {
        ...config,
        headers: {
          ...config.headers,
          token: await getToken(),
        },
      };
    });

    client.interceptors.response.use(undefined, async (error) => {
      if (error.response?.status === 401) {
        await deleteToken();
        showToast({ status: 'danger', message: 'Please log in again' });

        return navigation.navigate('Login');
      }

      console.log('Err', error);

      throw error;
    });

    return client;
  }, [showToast]);

  return api;
};
