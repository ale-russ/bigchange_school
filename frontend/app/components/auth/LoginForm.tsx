"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        // Fetch session to get user role
        const response = await fetch("/api/auth/session");
        const sessionData = await response.json();

        // Redirect based on Role
        if (sessionData?.user?.role === "admin") {
          router.push("/admin/dashboard");
        } else if (sessionData?.user.role === "teacher") {
          router.push("/teacher/dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-secondary"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          required
          aria-required="true"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-secondary"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          required
          aria-required="true"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Login
      </button>
      <p className="text-sm text-center text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
