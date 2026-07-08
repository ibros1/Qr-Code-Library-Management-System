import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCurrentUser, logout as logoutAction } from "../store/slices/authSlice";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, token, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [token, user, dispatch]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === "Admin",
    isLoading: status === "loading" || (Boolean(token) && !user && status !== "unauthenticated"),
    logout: () => dispatch(logoutAction()),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
