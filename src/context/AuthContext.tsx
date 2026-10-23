import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient, clearAuthState } from '../config/api';
import type { AuthSession, UserProfile } from '../types';

interface AuthContextValue {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (payload: Record<string, string>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = 'auth_token';
const LEGACY_TOKEN_KEY = 'token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const persistSession = async (accessToken: string, payload?: AuthSession | UserProfile | null) => {
    const sessionUser = (payload && 'user' in payload ? payload.user : payload) as UserProfile | null;
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    const refreshToken =
      payload && typeof payload === 'object' && 'refreshToken' in payload
        ? (payload as Record<string, unknown>).refreshToken
        : payload && typeof payload === 'object' && 'refresh_token' in payload
          ? (payload as Record<string, unknown>).refresh_token
          : null;
    if (typeof refreshToken === 'string' && refreshToken.length > 0) {
      await SecureStore.setItemAsync('refresh_token', refreshToken);
    }
    await SecureStore.deleteItemAsync(LEGACY_TOKEN_KEY);

    setToken(accessToken);
    setUser(sessionUser ?? null);

    if (apiClient.defaults.headers.common) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const legacyToken = await SecureStore.getItemAsync(LEGACY_TOKEN_KEY);
        if (legacyToken) {
          await SecureStore.setItemAsync(TOKEN_KEY, legacyToken);
          await SecureStore.deleteItemAsync(LEGACY_TOKEN_KEY);
        }

        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          if (apiClient.defaults.headers.common) {
            apiClient.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
          }

          try {
            const response = await apiClient.get('/auth/me');
            const payload = response.data?.data ?? response.data ?? null;
            setUser(payload && typeof payload === 'object' ? (payload as UserProfile) : null);
          } catch (error: any) {
            // A rejected session must not remain authenticated in local state.
            if (error?.response?.status === 401 || error?.response?.status === 403) {
              await clearAuthState();
              setToken(null);
              setUser(null);
              if (apiClient.defaults.headers.common) {
                delete apiClient.defaults.headers.common.Authorization;
              }
            } else {
              // Keep the session for transient network failures; protected requests remain server-authorized.
              setUser(null);
            }
          }
        }
      } catch (_error) {
        console.warn('Auth bootstrap failed', _error);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const payload = response.data?.data ?? response.data ?? {};
    const accessToken = payload.accessToken ?? payload.token ?? payload.access_token ?? null;

    if (!accessToken) {
      throw new Error('No access token returned');
    }

    await persistSession(accessToken, payload.user ?? payload);
  };

  const register = async (payload: Record<string, string>) => {
    const response = await apiClient.post('/auth/register', payload);
    const data = response.data?.data ?? response.data ?? {};
    const accessToken = data.accessToken ?? data.token ?? data.access_token ?? null;

    if (!accessToken) {
      throw new Error('No access token returned');
    }

    await persistSession(accessToken, data.user ?? data);
  };

  const refreshSession = async () => {
    if (!token) {
      return;
    }

    try {
      const response = await apiClient.post('/auth/refresh');
      const data = response.data?.data ?? response.data ?? {};
      const nextToken = data.accessToken ?? data.token ?? data.access_token ?? null;

      if (nextToken) {
        await persistSession(nextToken, user ?? null);
      }
    } catch (_error) {
      await signOut();
      throw _error;
    }
  };

  const signOut = async () => {
    await clearAuthState();
    if (apiClient.defaults.headers.common) {
      delete apiClient.defaults.headers.common.Authorization;
    }
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, loading, signIn, signOut, register, refreshSession }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
