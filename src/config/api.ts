import axios from 'axios';
import Constants from 'expo-constants';

const configuredApiUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  Constants.expoConfig?.extra?.apiUrl ??
  'https://api.sophia-central.com';

export const apiClient = axios.create({
  baseURL: configuredApiUrl.replace(/\/$/, ''),
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized request. User may need to re-authenticate.');
    }
    return Promise.reject(error);
  },
);

export async function clearAuthState() {
  // AuthContext owns secure token storage and clears it during sign-out.
}
