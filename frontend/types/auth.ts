export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  token?: string;
  phoneNumber?: string;
  address?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  class?: { id: string; name: string } | null;
}

export interface Parent {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  children?: [{ id: string; name: string }] | null;
}

export interface Class {
  id: string;
  name: string;
  level: string;
  teacher: { id: string; name: string; email: string; phoneNumber: string };
  students: { id: string; name: string; email: string }[];
}

export interface Session {
  user: User;
  accessToken: string;
}

export interface Credentials {
  email: string;
  password: string;
  name?: string;
  role?: "student" | "teacher" | "admin";
  isSignup?: boolean;
  phoneNumber?: string;
  address?: string;
}
