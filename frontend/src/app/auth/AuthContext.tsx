import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AuthSession, LoginPayload, RegisterStaffPayload, User } from "../types/auth";
import { login, logout, registerStaff } from "../api/services/auth.service";

const AUTH_STORAGE_KEY = "unihub-auth-session";

interface AuthContextValue {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  loginUser: (payload: LoginPayload) => Promise<void>;
  logoutUser: () => Promise<void>;
  continueAsGuest: () => void;
  registerStaffUser: (payload: RegisterStaffPayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): AuthSession {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return { user: null, isGuest: true };
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return { user: null, isGuest: true };
  }
}

function saveSession(session: AuthSession) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = readStoredSession();
    setUser(session.user);
    setIsGuest(session.isGuest);
    setIsLoading(false);
  }, []);

  const loginUser = async (payload: LoginPayload) => {
    const nextUser = await login(payload);
    setUser(nextUser);
    setIsGuest(false);
    saveSession({ user: nextUser, isGuest: false });
  };

  const logoutUser = async () => {
    await logout();
    setUser(null);
    setIsGuest(true);
    saveSession({ user: null, isGuest: true });
  };

  const continueAsGuest = () => {
    setUser(null);
    setIsGuest(true);
    saveSession({ user: null, isGuest: true });
  };

  const registerStaffUser = async (payload: RegisterStaffPayload) => {
    const nextUser = await registerStaff(payload);
    setUser(nextUser);
    setIsGuest(false);
    saveSession({ user: nextUser, isGuest: false });
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, isGuest, isLoading, loginUser, logoutUser, continueAsGuest, registerStaffUser }),
    [user, isGuest, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
