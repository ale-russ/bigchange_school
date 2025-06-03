"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      name,
      email,
      password,
      role,
      phoneNumber,
      address,
      isSignup: true,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/login");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-secondary"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          required
          aria-required="true"
        />
      </div>
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
      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-secondary"
        >
          Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setRole(e.target.value as "student" | "teacher" | "admin")
          }
          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-medium text-secondary"
        >
          Phone Number
        </label>
        <input
          type="text"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPhoneNumber(e.target.value)
          }
          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        />
      </div>
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-secondary"
        >
          Address
        </label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setAddress(e.target.value)
          }
          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Sign Up
      </button>
      <p className="text-sm text-center text-secondary">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
