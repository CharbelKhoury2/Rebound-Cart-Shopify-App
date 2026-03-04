import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { PlatformUser } from "@/types";
import { AuthService } from "@/services/auth";

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
      const { user: dbUser } = await AuthService.validateSession(token);
      if (dbUser && dbUser.status === 'ACTIVE') {
        setUser(dbUser);
        console.log('✅ Loaded user from token:', dbUser.email, 'Role:', dbUser.role);
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
      // For demo purposes, we'll create a simple login that finds or creates a user
      // In production, this would validate against actual credentials
      const { user: dbUser } = await AuthService.validateSession('demo');
      
      if (!dbUser) {
        // Create a demo user if none exists
        const newUser = await AuthService.createUser({
          email,
          firstName: email.split('@')[0],
          role: email.includes('admin') ? 'PLATFORM_ADMIN' : 'SALES_REP',
          tier: 'BRONZE'
        });
        
        if (newUser.status === 'PENDING') {
          // Auto-approve for demo
          const approvedUser = await AuthService.approveUser(newUser.id);
          setUser(approvedUser);
          const token = AuthService.generateToken({
            userId: approvedUser.id,
            email: approvedUser.email,
            role: approvedUser.role
          });
          sessionStorage.setItem('reboundcart_token', token);
          console.log('✅ SimpleAuth login successful (new user):', approvedUser.email, 'Role:', approvedUser.role);
          return true;
        }
      }
      
      if (dbUser && dbUser.status === 'ACTIVE') {
        setUser(dbUser);
        const token = AuthService.generateToken({
          userId: dbUser.id,
          email: dbUser.email,
          role: dbUser.role
        });
        sessionStorage.setItem('reboundcart_token', token);
        console.log('✅ SimpleAuth login successful:', dbUser.email, 'Role:', dbUser.role);
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
