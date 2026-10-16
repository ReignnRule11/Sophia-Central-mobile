import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../config/api';

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface AuthContextValue {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (payload: any) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const persistSession = async (accessToken: string, userData?: any) => {
    await SecureStore.setItemAsync('token', accessToken);
    setToken(accessToken);
    apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    setUser(userData ?? null);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('token');
        if (storedToken) {
          setToken(storedToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
          const response = await apiClient.get('/auth/me');
          const payload = response.data?.data ?? response.data;
          setUser(payload ?? null);
        }
      } catch (error) {
        console.warn('Auth bootstrap failed', error);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const payload = response.data?.data ?? response.data;
    const accessToken = payload?.accessToken ?? payload?.token ?? null;
    if (!accessToken) throw new Error('No access token returned');
    await persistSession(accessToken, payload.user ?? null);
  };

  const register = async (payload: any) => {
    const response = await apiClient.post('/auth/register', payload);
    const data = response.data?.data ?? response.data;
    const accessToken = data?.accessToken ?? data?.token ?? null;
    if (!accessToken) throw new Error('No access token returned');
    await persistSession(accessToken, data.user ?? null);
  };

  const refreshSession = async () => {
    if (!token) return;
    const response = await apiClient.post('/auth/refresh');
    const data = response.data?.data ?? response.data;
    const accessToken = data?.accessToken ?? data?.token ?? null;
    if (accessToken) {
      await persistSession(accessToken, user ?? null);
    }
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
