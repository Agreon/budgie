import { useNavigation } from '@react-navigation/native';
// eslint-disable-next-line import/no-unresolved
import { API_BASE_URL } from '@env';
import axios from 'axios';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import qs from 'qs';
import { useToast } from '../ToastProvider';
import { deleteToken, getToken } from '../util/token';
import { RFC3339_DATE_FORMAT } from '../util/globals';

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

      // Convert body dates to RFC_FORMAT
      let { data } = config;
      if (typeof data === 'object') {
        data = Object.entries(data as Record<string, any>).reduce((acc, [key, value]) => {
          if (dayjs(value).isValid() && key.toLocaleLowerCase().includes('date')) {
            return { ...acc, [key]: dayjs(value).format(RFC3339_DATE_FORMAT) };
          }

          return { ...acc, [key]: value };
        }, {} as Record<string, any>);
      }

      return {
        ...config,
        data,
        paramsSerializer: (params) => qs.stringify(params, {
          serializeDate: (date: Date) => dayjs(date).format(RFC3339_DATE_FORMAT),
        }),
        headers: {
          ...config.headers,
          // TODO: Is this inefficient?
          Authorization: await getToken(),
        },
      };
    });

    client.interceptors.response.use(undefined, async (error) => {
      if (error.response?.status === 401 && error.config?.url !== 'login') {
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
