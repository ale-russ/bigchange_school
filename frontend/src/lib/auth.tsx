"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface User {
  role: "admin" | "teacher" | null;
  token?: string;
}

interface AuthContextType {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role:"admin" | "teacher", phoneNumber: string, address: string, ) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({ role: null });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await axios.post(
        `http://localhost:5000/api/auth/login`,
        { email, password }
      );

      if (response.status !== 200)
        throw new Error("Invalid credentials. Please try again.");

      const {role} = await response.data?.user;
      const token = response.data?.token;
      
      if(role && (role === "admin" || role === "teacher")){
        setUser({ role: response.data?.role, token: response.data?.token, ...response.data?.user });
        localStorage.setItem("token", token);
        localStorage.setItem("role", response.data?.user?.role);
        localStorage.setItem("user",JSON.stringify(response.data?.user))
      }

      if(role === "admin") router.push("/admin/dashboard");
      else if(role === "teacher") router.push("/teacher/dashboard");  
    } catch (err) {
      console.error("Login error: ", err);
      throw new Error("Invalid credentials. Please try again.");
    } finally{
      setIsLoading(false)
    }
  };
  const register = async (
      name: string,
      email: string,
      password: string,
      role: "admin" | "teacher",
      phoneNumber: string,
      address: string,
    ) => {
      setIsLoading(true)
      try {
        const response = await axios.post(
          'http://localhost:5000/api/auth/signup',
          { name, email, password, role, phoneNumber, address,  }
        );
        if (response.status !== 200 && response.status !== 201)
          throw new Error(response?.data?.message || "Invalid credentials. Please try again.");

        const data = await response.data;
        const token = response.data?.token;
        role  = await response.data?.user?.role;
  
        if(role && (role === "admin" || role === "teacher")){
          setUser({ role: response.data?.role, token: response.data?.token, ...response.data?.user });
          localStorage.setItem("token", token);
          localStorage.setItem("role", response.data?.user?.role);
          localStorage.setItem("user",JSON.stringify(response.data?.user))
        }
  
        if(role === "admin") router.push("/admin/dashboard");
        else if(role === "teacher") router.push("/teacher/dashboard");  
        setUser({ role: data.role, token: data.token, ...data.user });
      } catch (err:any) {
        throw new Error(err.response?.data?.message || "Invalid credentials. Please try again.");
      }finally{
        setIsLoading(false)
      }
    };

  const logout = () => {
     setUser({ role: null });
    localStorage.clear();
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
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
