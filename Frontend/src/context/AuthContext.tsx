import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../services/api";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (
    username: string,
    password: string
  ) => Promise<void>;

  register: (
    username: string,
    password: string
  ) => Promise<void>;

  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const expireDate = localStorage.getItem("expireDate");

    if (!savedToken || !expireDate) {
      setLoading(false);
      return;
    }

    if (new Date(expireDate) <= new Date()) {
      localStorage.removeItem("token");
      localStorage.removeItem("expireDate");

      setToken(null);
    } else {
      setToken(savedToken);
    }

    setLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string
  ) => {
    const response = await api.post<{
      token: string;
      expireDate: string;
    }>("/api/Account/Login", {
      username,
      password,
    });

    const { token, expireDate } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("expireDate", expireDate);

    setToken(token);
  };

  const register = async (
    username: string,
    password: string
  ) => {
    await api.post("/api/Account/Register", {
      username,
      password,
    });
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