import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { PlatformUser } from "@/types";
import { mockUsers } from "@/data/mockData";

interface AuthContextType {
  user: PlatformUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('reboundcart_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('reboundcart_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, _password: string) => {
    const found = mockUsers.find(
      (u) => u.email === email && u.status === "ACTIVE"
    );
    if (found) {
      setUser(found);
      localStorage.setItem('reboundcart_user', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('reboundcart_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
