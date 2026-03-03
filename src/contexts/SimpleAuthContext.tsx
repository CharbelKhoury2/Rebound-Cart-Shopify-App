import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { PlatformUser } from "@/types";
import { mockUsers } from "@/data/mockData";

interface SimpleAuthContextType {
  user: PlatformUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | null>(null);

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from sessionStorage on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('reboundcart_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('✅ Loaded user from session:', parsedUser.email, 'Role:', parsedUser.role);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        sessionStorage.removeItem('reboundcart_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, _password: string) => {
    console.log('🔐 SimpleAuth login attempt:', email);
    
    const found = mockUsers.find(
      (u) => u.email === email && u.status === "ACTIVE"
    );
    
    if (found) {
      setUser(found);
      // Store in sessionStorage
      sessionStorage.setItem('reboundcart_user', JSON.stringify(found));
      console.log('✅ SimpleAuth login successful:', found.email, 'Role:', found.role);
      return true;
    }
    
    console.log('❌ SimpleAuth login failed for:', email);
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('reboundcart_user');
    console.log('🔓 SimpleAuth logout successful');
  };

  // Force clear all session storage for debugging
  const forceClearSession = () => {
    sessionStorage.clear();
    setUser(null);
    console.log('🧹 Session storage cleared');
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
