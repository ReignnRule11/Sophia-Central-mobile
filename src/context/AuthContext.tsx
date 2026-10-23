import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient, clearAuthState } from '../config/api';

interface UserProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  [key: string]: unknown;
}

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
const COOKIE_SESSION = 'cookie-session';

function responsePayload(response: any): any {
  return response?.data?.data ?? response?.data ?? {};
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = async (payload: any) => {
    if (typeof payload?.csrfToken === 'string' && payload.csrfToken.length > 0) {
      await SecureStore.setItemAsync('csrf_token', payload.csrfToken);
    }
    setToken(COOKIE_SESSION);
    setUser(payload?.user && typeof payload.user === 'object' ? payload.user : null);
  };

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        const payload = responsePayload(response);
        if (mounted && payload?.user && typeof payload.user === 'object') {
          setToken(COOKIE_SESSION);
          setUser(payload.user);
        }
      } catch (error: any) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          await clearAuthState();
          if (mounted) {
            setToken(null);
            setUser(null);
          }
        } else if (mounted) {
          // A transient network failure must not fabricate an authenticated user.
          setToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();
    return () => { mounted = false; };
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const payload = responsePayload(response);
    if (!payload?.user || typeof payload.user !== 'object' || typeof payload.csrfToken !== 'string') {
      throw new Error('Backend auth contract mismatch: expected user and csrfToken from POST /auth/login.');
    }
    await applySession(payload);
  };

  const register = async (payload: Record<string, string>) => {
    const response = await apiClient.post('/auth/signup', payload);
    const data = responsePayload(response);
    if (!data?.user || typeof data.user !== 'object' || typeof data.csrfToken !== 'string') {
      throw new Error('Backend auth contract mismatch: expected user and csrfToken from POST /auth/signup.');
    }
    await applySession(data);
  };

  const refreshSession = async () => {
    const response = await apiClient.get('/auth/me');
    const payload = responsePayload(response);
    if (!payload?.user || typeof payload.user !== 'object') {
      await signOut();
      throw new Error('Session is no longer valid.');
    }
    setToken(COOKIE_SESSION);
    setUser(payload.user);
  };

  const signOut = async () => {
    try {
      if (token) await apiClient.post('/auth/logout');
    } finally {
      await clearAuthState();
      setToken(null);
      setUser(null);
    }
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
