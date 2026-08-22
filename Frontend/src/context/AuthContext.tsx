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
  const [token, setToken] = useState<string | null>(getInitialToken);
  const loading = false;

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