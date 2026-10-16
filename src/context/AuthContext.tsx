import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../config/api';

interface AuthContextValue {
  token: string | null;
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (payload: any) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('token');
        if (storedToken) {
          setToken(storedToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
          const res = await apiClient.get('/auth/me');
          setUser(res.data?.data ?? res.data);
        }
      } catch (error) {
        console.warn('Auth bootstrap failed', error);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const persistSession = async (accessToken: string, userData?: any) => {
    await SecureStore.setItemAsync('token', accessToken);
    setToken(accessToken);
    apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    setUser(userData ?? null);
  };

  const signIn = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const payload = response.data?.data ?? response.data;
    await persistSession(payload.accessToken, payload.user);
  };

  const register = async (payload: any) => {
    const response = await apiClient.post('/auth/register', payload);
    const data = response.data?.data ?? response.data;
    await persistSession(data.accessToken, data.user);
  };

  const refreshSession = async () => {
    const currentToken = token;
    if (!currentToken) return;
    const response = await apiClient.post('/auth/refresh');
    const data = response.data?.data ?? response.data;
    await persistSession(data.accessToken, data.user ?? user);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('token');
    delete apiClient.defaults.headers.common.Authorization;
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, signIn, signOut, register, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
