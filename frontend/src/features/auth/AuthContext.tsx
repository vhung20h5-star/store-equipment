import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

import { User, LoginRequest, RegisterRequest } from "@/types";
import {
  getAuthToken,
  setAuthToken,
  loginApi,
  registerApi,
  fetchCurrentUser,
} from "@/services/api";
import { useToast } from "@/context/ToastContext";

export interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (data: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { showToast } = useToast();

  // Check auth on initial mount
  useEffect(() => {
    const token = getAuthToken();

    if (token) {
      fetchCurrentUser()
        .then((user) => {
          setCurrentUser(user);
        })
        .catch(() => {
          setAuthToken(null);
          setCurrentUser(null);
        });
    }
  }, []);

  const login = useCallback(
    async (data: LoginRequest): Promise<User> => {
      const res = await loginApi(data);

      setAuthToken(res.token);
      setCurrentUser(res.user);

      return res.user;
    },
    [],
  );

  const register = useCallback(
    async (data: RegisterRequest): Promise<User> => {
      const res = await registerApi(data);

      setAuthToken(res.token);
      setCurrentUser(res.user);

      return res.user;
    },
    [],
  );

  const logout = useCallback(() => {
    setAuthToken(null);
    setCurrentUser(null);
    showToast("Đã đăng xuất", "Hẹn gặp lại bạn!", "info");
  }, [showToast]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

