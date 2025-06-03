import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: "student" | "teacher" | "admin";
    token?: string;
    phoneNumber?: string;
    address?: string;
  }

  interface Session extends DefaultSession {
    user: User;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId: string;
    role: "student" | "teacher" | "admin";
    accessToken?: string;
    phoneNumber?: string;
    address?: string;
  }
}
