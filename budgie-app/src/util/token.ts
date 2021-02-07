import * as SecureStore from 'expo-secure-store';

export const setToken = async (token: string) => {
  if (await SecureStore.isAvailableAsync()) {
    return SecureStore.setItemAsync('access_token', token);
  }

  return localStorage.setItem('access_token', token);
};

export const getToken = async () => {
  if (await SecureStore.isAvailableAsync()) {
    return SecureStore.getItemAsync('access_token');
  }

  return localStorage.getItem('access_token');
};
