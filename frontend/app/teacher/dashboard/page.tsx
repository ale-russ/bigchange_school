"use client";

import { useSession } from "next-auth/react";

export default function TeacherDashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!session || session.user.role !== "teacher") {
    return <div className="text-center text-red-500 py-12">Access Denied</div>;
  }

  return (
    <div className="container py-12">
      <div className="card">
        <h1 className="text-3xl font-bold mb-4 text-primary">
          Teacher Dashboard
        </h1>
        <p className="mb-6 text-secondary">Welcome, {session.user.name}!</p>
        <h2 className="text-2xl font-semibold mb-4 text-secondary">
          Your Classes
        </h2>
        <p className="mb-6 text-secondary">
          No classes scheduled yet. (Zoom integration coming soon!)
        </p>
        <button className="bg-primary text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary">
          Create New Class
        </button>
      </div>
    </div>
  );
}
