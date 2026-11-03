import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient, clearAuthState } from '../config/api';

export interface UserProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'student' | 'lecturer' | 'moderator' | 'admin' | string;
  institution?: string;
  faculty?: string;
  department?: string;
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

function payloadOf(response: any): any {
  return response?.data?.data ?? response?.data ?? {};
}

async function initializeCsrfToken(): Promise<void> {
  const response = await apiClient.get('/auth/csrf');
  const payload = payloadOf(response);
  const csrfToken = payload?.csrfToken;
  if (typeof csrfToken !== 'string' || !csrfToken) {
    throw new Error('The backend did not issue a CSRF token.');
  }
  await SecureStore.setItemAsync('csrf_token', csrfToken);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    const response = await apiClient.get('/auth/me');
    const payload = payloadOf(response);
    if (!payload?.user || typeof payload.user !== 'object') {
      throw new Error('The backend did not return an authenticated user.');
    }
    setToken(COOKIE_SESSION);
    setUser(payload.user);
  };

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        const payload = payloadOf(response);
        if (mounted && payload?.user && typeof payload.user === 'object') {
          setToken(COOKIE_SESSION);
          setUser(payload.user);
          // Re-issue the CSRF token for this native session. The backend auth
          // strategy accepts the HttpOnly session cookie on native requests.
          await initializeCsrfToken();
        }
      } catch (error: any) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          await clearAuthState();
          if (mounted) {
            setToken(null);
            setUser(null);
          }
        } else if (mounted) {
          // Do not manufacture an authenticated state when the API is offline.
          setToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void bootstrap();
    return () => { mounted = false; };
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const payload = payloadOf(response);
    if (!payload?.user || typeof payload.user !== 'object') {
      throw new Error('Backend auth contract mismatch: POST /auth/login must return a user.');
    }
    // Login sets the HttpOnly access cookie. The separate CSRF endpoint issues
    // the readable token required for subsequent protected mutations.
    await initializeCsrfToken();
    await refreshSession();
  };

  const register = async (payload: Record<string, string>) => {
    const response = await apiClient.post('/auth/signup', payload);
    const data = payloadOf(response);
    if (!data?.user || typeof data.user !== 'object') {
      throw new Error('Backend auth contract mismatch: POST /auth/signup must return a user.');
    }
    if (typeof data.csrfToken === 'string' && data.csrfToken) {
      await SecureStore.setItemAsync('csrf_token', data.csrfToken);
    } else {
      await initializeCsrfToken();
    }
    setToken(COOKIE_SESSION);
    setUser(data.user);
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
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
