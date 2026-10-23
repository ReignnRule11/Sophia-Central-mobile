import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/$/, '');

const client = axios.create({
  baseURL: API_URL || undefined,
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(async (config) => {
  if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured. Set it to the verified Sophia Central backend HTTPS URL.');
  }

  const method = (config.method ?? 'get').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = await SecureStore.getItemAsync('csrf_token');
    if (csrfToken) config.headers.set('X-CSRF-Token', csrfToken);
  }
  return config;
});

export default client;
