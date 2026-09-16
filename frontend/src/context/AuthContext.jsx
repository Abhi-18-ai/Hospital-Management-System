import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth.api';
import { setAccessToken, setUnauthorizedHandler, getErrorMessage } from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  // On first load, try to silently refresh using the HTTP-only cookie so a
  // page reload doesn't force a fresh login as long as the session is valid.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const refreshResponse = await authApi.refresh();
        const token = refreshResponse.data?.data?.accessToken;
        setAccessToken(token);
        const meResponse = await authApi.me();
        if (!cancelled) setUser(meResponse.data?.data);
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    }

    bootstrap();
    setUnauthorizedHandler(clearSession);
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    const response = await authApi.login({ email, password });
    const { user: loggedInUser, accessToken } = response.data.data;
    setAccessToken(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await authApi.register(payload);
    const { user: newUser, accessToken } = response.data.data;
    setAccessToken(accessToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = { user, setUser, isInitializing, login, register, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export { getErrorMessage };
