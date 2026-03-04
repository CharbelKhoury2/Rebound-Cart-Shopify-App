import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { PlatformUser } from "@/types";
import { apiService } from "@/services/api";

interface SimpleAuthContextType {
  user: PlatformUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | null>(null);

const TOKEN_KEY = 'reboundcart_token';
const USER_KEY = 'reboundcart_user';

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount: restore from localStorage immediately, then validate silently in background
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        // Immediately restore from cache so admin doesn't get kicked on refresh
        const cachedUser = JSON.parse(storedUser) as PlatformUser;
        setUser(cachedUser);
        setIsLoading(false);

        // Silently validate in background — only logout on explicit auth failure (401)
        validateTokenInBackground(storedToken);
      } catch {
        setIsLoading(false);
      }
    } else if (storedToken) {
      // Token exists without user cache — validate properly
      validateAndLoadUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateTokenInBackground = async (token: string) => {
    try {
      const { user: apiUser } = await apiService.validateToken(token);
      if (apiUser && apiUser.status === 'ACTIVE') {
        // Update with fresh data from server
        setUser(apiUser);
        localStorage.setItem(USER_KEY, JSON.stringify(apiUser));
        console.log('✅ Background token validated:', apiUser.email);
      } else {
        // Server explicitly says session is invalid — log out
        console.warn('⚠️ Session invalidated by server (inactive or not found)');
        clearSession();
      }
    } catch (error) {
      // Network error or server unavailable — keep user logged in with cached data
      // Do NOT log them out just because the server is temporarily unreachable
      console.warn('⚠️ Background token validation failed (network?). Keeping cached session.', error);
    }
  };

  const validateAndLoadUser = async (token: string) => {
    try {
      const { user: apiUser } = await apiService.validateToken(token);
      if (apiUser && apiUser.status === 'ACTIVE') {
        setUser(apiUser);
        localStorage.setItem(USER_KEY, JSON.stringify(apiUser));
        console.log('✅ Loaded user from token:', apiUser.email, 'Role:', apiUser.role);
      } else {
        clearSession();
      }
    } catch (error) {
      console.error('Failed to validate token:', error);
      clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const login = async (email: string, password: string) => {
    console.log('🔐 SimpleAuth login attempt:', email);

    try {
      const { user: apiUser, token } = await apiService.login(email, password);

      if (apiUser && apiUser.status === 'ACTIVE') {
        setUser(apiUser);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(apiUser));
        console.log('✅ SimpleAuth login successful:', apiUser.email, 'Role:', apiUser.role);
        return true;
      }

      console.log('❌ SimpleAuth login failed for:', email);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    clearSession();
    console.log('🔓 SimpleAuth logout successful');
  };

  return (
    <SimpleAuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const ctx = useContext(SimpleAuthContext);
  if (!ctx) throw new Error("useSimpleAuth must be used within SimpleAuthProvider");
  return ctx;
}
