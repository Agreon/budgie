import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useMemo } from 'react';
import { useToast } from '../ToastProvider';
import { deleteToken, getToken } from '../util/token';
import { API_BASE_URL } from '@env'

export const useApi = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();

  const api = useMemo(() => {
    const client = axios.create({
      baseURL: API_BASE_URL,
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

      console.log('Err', JSON.stringify(error));

      throw error;
    });

    return client;
  }, [showToast]);

  return api;
};
