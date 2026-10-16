import axios from 'axios';
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: apiUrl,
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
