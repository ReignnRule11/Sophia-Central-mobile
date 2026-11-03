import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Match the production API base URL used by the web frontend. EAS/local
// environment configuration can override this without changing application code.
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://sophia-central-backend.onrender.com').trim().replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const method = (config.method ?? 'get').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = await SecureStore.getItemAsync('csrf_token');
    if (csrfToken) config.headers.set('X-CSRF-Token', csrfToken);
  }
  return config;
});

export async function clearAuthState() {
  await SecureStore.deleteItemAsync('csrf_token');
}
