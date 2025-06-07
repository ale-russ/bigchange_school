"use client";

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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock auth check (replace with actual API call)
    const user = { role: "teacher" }; // Example: fetch from auth context or API
    if (user.role === allowedRole) {
      setIsAuthorized(true);
    } else {
      router.push("/login");
    }
    setIsLoading(false);
  }, [allowedRole, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
