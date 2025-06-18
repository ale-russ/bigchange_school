export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  token?: string;
  phoneNumber?: string;
  address?: string;
  classes?: [];
}

export interface Student {
  id: string;
  name: string;
  phoneNumber?: string;
  address?: string;
  level?: string;
  class?: { id: string; name: string } | null;
  parentIds: string[];
}

export interface Parent {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  children: { id: string; name: string; phoneNumber?: string }[];
}

export interface Class {
  id: string;
  name: string;
  level: string;
  teacher: { id: string; name: string; email: string; phoneNumber: string };
  // students: { id: string; name: string }[];
  students: Student[];
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
