import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { User } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        role: { label: "Role", type: "text" },
        phoneNumber: { label: "Phone Number", type: "text" },
        address: { label: "Address", type: "text" },
        isSignup: { label: "Is Signup", type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        const { email, password, name, role, phoneNumber, address, isSignup } =
          credentials || {};

        if (!email || !password)
          throw new Error("Email and password are required");

        try {
          const endpoint = isSignup
            ? "http://localhost:5000/api/auth/signup"
            : "http://localhost:5000/api/auth/login";

          const payload = isSignup
            ? { name, email, password, role, phoneNumber, address }
            : { email, password };

          const response = await axios.post(endpoint, payload);
          const { user, token } = response.data;

          if (!user || !token) throw new Error("Internal Server Error");

          return {
            id: user.id || user._id?.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            address: user.address,
            token,
          };
        } catch (error: any) {
          throw new Error(
            error.response?.data?.message || "Authentication failed"
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.accessToken = user.token;
        token.phoneNumber = user.phoneNumber;
        token.address = user.address;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.userId,
        name: token.name as string,
        email: token.email as string,
        role: token.role,
        phoneNumber: token.phoneNumber,
        address: token.address,
      };
      session.accessToken = token.accessToken as string;
      return session;
    },
    async signIn({ user }) {
      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
    // signOut: "/auth/login",
    // error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
