import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface Token {
  userId: string;
  role: "student" | "teacher" | "admin";
  accessToken?: string;
  phoneNumber?: string;
  address?: string;
}

export async function middleware(req: NextRequest) {
  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as Token | null;

  const { pathname } = req.nextUrl;

  // Allow access to auth pages if not logged in
  if (pathname.startsWith("/auth")) {
    if (
      token &&
      (pathname === "/auth/login" || pathname === "/auth/register")
    ) {
      const role = token.role;
      const redirectUrl =
        role === "admin"
          ? "/admin/dashboard"
          : role === "teacher"
          ? "/teacher/dashboard"
          : "/student/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    return NextResponse.next();
  }

  // Protect role-specific routes
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const role = token.role;
  if (
    (pathname.startsWith("/admin") && role !== "admin") ||
    (pathname.startsWith("/teacher") && role !== "teacher") ||
    (pathname.startsWith("/student") && role !== "student")
  ) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/auth/:path*",
  ],
};
