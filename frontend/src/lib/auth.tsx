"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";

interface User {
  role: "admin" | "teacher" | null;
  token?: string;
}

interface AuthContextType {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  //   register: (email: string, password: string, role:"admin" | "teacher", name: string, phoneNumber: string, address: string) => Promise<void>;
  //   isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({ role: null });
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/auth/login`,
        { email, password }
      );

      if (response.status !== 200)
        throw new Error("Invalid credentials. Please try again.");

      const data = await response.data;
      setUser({ role: data.role, token: data.token, ...data.user });
    } catch (err) {
      throw new Error("Invalid credentials. Please try again.");
    }
  };
  const register = async (
    email: string,
    password: string,
    name: string,
    role: "admin" | "teacher",
    phoneNumber: string,
    address: string
  ) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/auth/signup`,
        { email, password, name, role, phoneNumber, address }
      );

      if (response.status !== 200)
        throw new Error("Invalid credentials. Please try again.");

      const data = await response.data;
      setUser({ role: data.role, token: data.token, ...data.user });
    } catch (err) {
      throw new Error("Invalid credentials. Please try again.");
    }
  };

  const logout = () => {
    setUser({ role: null, token: undefined });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
