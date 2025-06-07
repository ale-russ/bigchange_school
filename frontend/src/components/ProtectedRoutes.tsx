"use client";

import { useAuth } from "@/lib/auth";
import { setLazyProp } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  allowedRole: "admin" | "teacher";
  children: React.ReactNode;
}

export default function ProtectedRoute({
  allowedRole,
  children,
}: ProtectedRouteProps) {
  const router = useRouter();
  const {user} = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token =  localStorage.getItem("token");;
    if(!token || !user.role || user.role !== allowedRole) {
      router.push("/login");
    } else {
      setIsLoading(false)
    }
  }, [user.role, allowedRole, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

 
  return <>{children}</>;
}
