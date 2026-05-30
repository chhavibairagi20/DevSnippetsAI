import * as SecureStore from 'expo-secure-store';
import { SECURE_KEYS } from '../constants/storageKeys';

export const saveOpenRouterApiKey = async (key: string): Promise<void> => {
  await SecureStore.setItemAsync(SECURE_KEYS.OPENROUTER_API_KEY, key);
  await SecureStore.deleteItemAsync(SECURE_KEYS.GEMINI_API_KEY);
};

export const getOpenRouterApiKey = async (): Promise<string | null> => {
  try {
    const key = await SecureStore.getItemAsync(SECURE_KEYS.OPENROUTER_API_KEY);
    if (key) return key;
    return await SecureStore.getItemAsync(SECURE_KEYS.GEMINI_API_KEY);
  } catch {
    return null;
  }
};

export const deleteOpenRouterApiKey = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(SECURE_KEYS.OPENROUTER_API_KEY);
  await SecureStore.deleteItemAsync(SECURE_KEYS.GEMINI_API_KEY);
};
