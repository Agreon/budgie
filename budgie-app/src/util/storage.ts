import * as SecureStore from 'expo-secure-store';

export class StorageItemNotFoundError extends Error {}

export const setStorageItem = async (key: string, item: string) => {
  if (await SecureStore.isAvailableAsync()) {
    return SecureStore.setItemAsync(key, item);
  }

  return localStorage.setItem(key, item);
};

export const deleteStorageItem = async (key: string) => {
  if (await SecureStore.isAvailableAsync()) {
    return SecureStore.deleteItemAsync(key);
  }

  return localStorage.removeItem(key);
};

export const getStorageItem = async (key: string) => {
  if (await SecureStore.isAvailableAsync()) {
    return SecureStore.getItemAsync(key);
  }

  return localStorage.getItem(key);
};

export const getStorageItemOrFail = async (key: string) => {
  const item = await getStorageItem(key);

  if (!item) {
    throw new StorageItemNotFoundError();
  }

  return item;
};
