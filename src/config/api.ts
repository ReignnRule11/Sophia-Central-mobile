import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const apiUrl =
  Constants.expoConfig?.extra?.apiUrl ??
  Constants.manifest?.extra?.apiUrl ??
  process.env.API_URL ??
  'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: apiUrl,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const TOKEN_KEY = 'auth_token';
const REFRESH_KEY = 'refresh_token';

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_error) {
    // Ignore storage failures and continue without auth.
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    if (error?.response?.status === 401 && !originalRequest?._retry) {
      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
        if (!refreshToken) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          return Promise.reject(error);
        }

        originalRequest._retry = true;
        const response = await axios.post(`${apiUrl}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newToken = response.data?.accessToken ?? response.data?.token ?? response.data?.access_token;
        const nextRefreshToken = response.data?.refreshToken ?? response.data?.refresh_token;

        if (newToken) {
          await SecureStore.setItemAsync(TOKEN_KEY, newToken);
          if (nextRefreshToken) {
            await SecureStore.setItemAsync(REFRESH_KEY, nextRefreshToken);
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          return apiClient(originalRequest);
        }
      } catch (_refreshError) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_KEY);
      }
    }

    return Promise.reject(error);
  },
);

export const clearAuthState = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
};
