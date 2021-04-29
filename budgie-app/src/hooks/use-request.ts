import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useMemo } from 'react';
import { useToast } from '../ToastProvider';
import { deleteToken, getToken } from '../util/token';

export const useApi = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();

  const api = useMemo(() => {
    const client = axios.create({
      baseURL: 'http://192.168.178.43:8080',
      // baseURL: 'http://localhost:8080',
    });

    client.interceptors.request.use(async (config) => {
      if (config.url === '/login') {
        return config;
      }

      return {
        ...config,
        headers: {
          ...config.headers,
          Authorization: await getToken(),
        },
      };
    });

    client.interceptors.response.use(undefined, async (error) => {
      if (error.response?.status === 401) {
        await deleteToken();
        showToast({ status: 'danger', message: 'Please log in again' });

        return navigation.navigate('Login');
      }

      console.error('Err', JSON.stringify(error));

      throw error;
    });

    return client;
  }, [showToast, navigation]);

  return api;
};
