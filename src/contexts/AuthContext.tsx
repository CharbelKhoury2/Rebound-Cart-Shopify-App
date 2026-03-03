import { createContext, useContext, useState, ReactNode } from "react";
import type { PlatformUser } from "@/types";
import { mockUsers } from "@/data/mockData";

interface AuthContextType {
  user: PlatformUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlatformUser | null>(null);

  const login = (email: string, _password: string) => {
    const found = mockUsers.find(
      (u) => u.email === email && u.status === "ACTIVE"
    );
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
