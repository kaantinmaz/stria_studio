import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { api } from './api';
import { clearToken, getToken, setToken } from './storage';
import type { AuthData, Loyalty, User } from './types';

type AuthContextValue = {
  user: User | null;
  loyalty: Loyalty | null;
  isReady: boolean;
  isAuthenticated: boolean;
  saveSession: (session: AuthData) => Promise<void>;
  refreshMe: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loyalty, setLoyalty] = useState<Loyalty | null>(null);
  const [isReady, setIsReady] = useState(false);

  const refreshMe = useCallback(async () => {
    const data = await api.me();
    setUser(data.user);
    setLoyalty(data.loyalty);
  }, []);

  useEffect(() => {
    let active = true;
    async function restoreSession() {
      const token = await getToken();
      if (token) {
        try {
          const data = await api.me();
          if (active) {
            setUser(data.user);
            setLoyalty(data.loyalty);
          }
        } catch {
          if (active) {
            setUser(null);
            setLoyalty(null);
          }
        }
      }
      if (active) setIsReady(true);
    }
    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const saveSession = useCallback(async (session: AuthData) => {
    await setToken(session.token);
    setUser(session.user);
    setLoyalty(null);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      await clearToken();
      setUser(null);
      setLoyalty(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loyalty, isReady, isAuthenticated: Boolean(user), saveSession, refreshMe, signOut }),
    [isReady, loyalty, refreshMe, saveSession, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth, AuthProvider içinde kullanılmalıdır.');
  return context;
}
