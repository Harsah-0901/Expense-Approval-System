import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { User, UserRole } from "@/types/expense";
import {
  apiLogin,
  apiSignup,
  getStoredToken,
  getStoredUser,
  storeAuth,
  clearAuth,
  SignupPayload,
} from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (payload: SignupPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function apiUserToUser(u: {
  id: string;
  email: string;
  name: string;
  role: string;
  managerId?: string;
  department: string;
}): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role as UserRole,
    managerId: u.managerId,
    department: u.department,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored && getStoredToken()) {
      setUser(apiUserToUser(stored));
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const data = await apiLogin(email, password);
        storeAuth(data.access_token, data.user);
        setUser(apiUserToUser(data.user));
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Login failed" };
      }
    },
    []
  );

  const signup = useCallback(
    async (payload: SignupPayload): Promise<{ success: boolean; error?: string }> => {
      try {
        const data = await apiSignup(payload);
        storeAuth(data.access_token, data.user);
        setUser(apiUserToUser(data.user));
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Signup failed" };
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const switchRole = useCallback((_role: UserRole) => {
    // No-op when using API - each user has one role
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, signup, logout, switchRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
