import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useMemo } from 'react';
import { useToast } from '../ToastProvider';
import { deleteToken, getToken } from '../util/token';

export const useRequest = () => {
  const request = useMemo(() => {
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

    return client;
  }, []);

  return request;
};

export const useApi = () => {
  const request = useRequest();
  const navigation = useNavigation();
  const { showToast } = useToast();

  const api = useMemo(() => {
    request.interceptors.response.use(undefined, async (error) => {
      if (error.response?.status === 401) {
        await deleteToken();
        showToast({ status: 'danger', message: 'Please log in again' });

        return navigation.navigate('Login');
      }

      console.log('Err', JSON.stringify(error));

      throw error;
    });

    return request;
  }, [request, navigation, showToast]);

  return api;
};
