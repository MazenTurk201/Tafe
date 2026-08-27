/* eslint-disable react-refresh/only-export-components -- context + hook co-located by design */

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { authApi } from "../api/authApi";
import type { RegisterRequest } from "../types/auth";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  hasRole: (role: string) => boolean;

  login: (
    username: string,
    password: string,
    rememmberMe: boolean
  ) => Promise<void>;

  register: (
    data: RegisterRequest
  ) => Promise<void>;

  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Get roles from JWT token
 */
function getRolesFromToken(token: string | null): string[] {
  if (!token) {
    return [];
  }

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    // ASP.NET Core Identity role claim
    const aspNetRoleClaim =
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

    const roles =
      payload[aspNetRoleClaim] ??
      payload.role ??
      payload.roles;

    // If roles is an array
    if (Array.isArray(roles)) {
      return roles;
    }

    // If there is only one role
    if (typeof roles === "string") {
      return [roles];
    }

    return [];
  } catch {
    return [];
  }
}

function getInitialToken(): string | null {
  const savedToken = localStorage.getItem("token");
  const expireDate = localStorage.getItem("expireDate");

  if (!savedToken || !expireDate) {
    return null;
  }

  if (new Date(expireDate) <= new Date()) {
    localStorage.removeItem("token");
    localStorage.removeItem("expireDate");

    return null;
  }

  return savedToken;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(
    getInitialToken
  );

  const loading = false;

  /**
   * Check if the logged-in user has a specific role
   */
  const hasRole = (role: string): boolean => {
    const roles = getRolesFromToken(token);

    return roles.some(
      (userRole) =>
        userRole.toLowerCase() === role.toLowerCase()
    );
  };

  const login = async (
    username: string,
    password: string,
    rememmberMe: boolean
  ) => {
    const { token, expires } = await authApi.login({
      username,
      password,
      rememmberMe,
    });

    localStorage.setItem("token", token);
    localStorage.setItem("expireDate", expires);

    setToken(token);
  };

  const register = async (
    data: RegisterRequest
  ) => {
    await authApi.register(data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("expireDate");

    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        loading,
        hasRole,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}