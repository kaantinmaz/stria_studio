import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'stria_auth_token';

function hasWebStorage() {
  return Platform.OS === 'web' && typeof globalThis.localStorage !== 'undefined';
}

export async function getToken() {
  if (hasWebStorage()) return globalThis.localStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string) {
  if (hasWebStorage()) {
    globalThis.localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  if (hasWebStorage()) {
    globalThis.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

const CHAT_CONSENT_KEY = 'chat_consent_v1';

export async function getChatConsent() {
  if (hasWebStorage()) return globalThis.localStorage.getItem(CHAT_CONSENT_KEY) === '1';
  return (await SecureStore.getItemAsync(CHAT_CONSENT_KEY)) === '1';
}

export async function setChatConsent() {
  if (hasWebStorage()) {
    globalThis.localStorage.setItem(CHAT_CONSENT_KEY, '1');
    return;
  }
  await SecureStore.setItemAsync(CHAT_CONSENT_KEY, '1');
}

export async function clearChatConsent() {
  if (hasWebStorage()) {
    globalThis.localStorage.removeItem(CHAT_CONSENT_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(CHAT_CONSENT_KEY);
}
