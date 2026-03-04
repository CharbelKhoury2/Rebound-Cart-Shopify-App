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

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from sessionStorage on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem('reboundcart_token');
    if (storedToken) {
      validateAndLoadUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateAndLoadUser = async (token: string) => {
    try {
      const { user: apiUser } = await apiService.validateToken(token);
      if (apiUser && apiUser.status === 'ACTIVE') {
        setUser(apiUser);
        console.log('✅ Loaded user from token:', apiUser.email, 'Role:', apiUser.role);
      } else {
        sessionStorage.removeItem('reboundcart_token');
      }
    } catch (error) {
      console.error('Failed to validate token:', error);
      sessionStorage.removeItem('reboundcart_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('🔐 SimpleAuth login attempt:', email);
    
    try {
      const { user: apiUser, token } = await apiService.login(email, password);
      
      if (apiUser && apiUser.status === 'ACTIVE') {
        setUser(apiUser);
        sessionStorage.setItem('reboundcart_token', token);
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
    setUser(null);
    sessionStorage.removeItem('reboundcart_token');
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
