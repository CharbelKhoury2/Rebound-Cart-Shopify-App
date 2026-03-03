import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { PlatformUser } from "@/types";
import { mockUsers } from "@/data/mockData";

interface TabAuthContextType {
  user: PlatformUser | null;
  isLoading: boolean;
  tabId: string;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  switchUser: () => void;
}

const TabAuthContext = createContext<TabAuthContextType | null>(null);

export function TabAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tabId, setTabId] = useState<string>('');

  // Generate unique tab ID on mount
  useEffect(() => {
    const existingTabId = sessionStorage.getItem('reboundcart_tab_id');
    if (existingTabId) {
      console.log('🔄 Using existing tab ID:', existingTabId.slice(-8));
      setTabId(existingTabId);
    } else {
      const newTabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🆕 Generated new tab ID:', newTabId.slice(-8));
      sessionStorage.setItem('reboundcart_tab_id', newTabId);
      setTabId(newTabId);
    }
  }, []);

  // Load user from sessionStorage on mount (tab-specific)
  useEffect(() => {
    if (!tabId) return;
    
    const storedUser = sessionStorage.getItem(`reboundcart_user_${tabId}`);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        sessionStorage.removeItem(`reboundcart_user_${tabId}`);
      }
    }
    setIsLoading(false);
  }, [tabId]);

  const login = (email: string, _password: string) => {
    if (!tabId) {
      console.error('Tab ID not set yet');
      return false;
    }
    
    const found = mockUsers.find(
      (u) => u.email === email && u.status === "ACTIVE"
    );
    if (found) {
      setUser(found);
      // Store in sessionStorage (tab-specific)
      sessionStorage.setItem(`reboundcart_user_${tabId}`, JSON.stringify(found));
      console.log('✅ Login successful:', found.email, 'Tab:', tabId.slice(-8));
      return true;
    }
    console.log('❌ Login failed: User not found or inactive');
    return false;
  };

  const logout = () => {
    setUser(null);
    // Remove from sessionStorage (tab-specific)
    sessionStorage.removeItem(`reboundcart_user_${tabId}`);
  };

  const switchUser = () => {
    // Clear current user and show login screen
    logout();
  };

  return (
    <TabAuthContext.Provider value={{ user, isLoading, tabId, login, logout, switchUser }}>
      {children}
    </TabAuthContext.Provider>
  );
}

export function useTabAuth() {
  const ctx = useContext(TabAuthContext);
  if (!ctx) throw new Error("useTabAuth must be used within TabAuthProvider");
  return ctx;
}
