"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import TeacherManager from "@/app/components/admin/TeacherManager";
import ClassManager from "@/app/components/admin/ClassManager";
import StudentManager from "@/app/components/admin/StudentManager";
import ParentManager from "@/app/components/admin/ParentManager";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<
    "teachers" | "students" | "classes" | "parents"
  >("teachers");

  if (status === "loading")
    return <p className="text-center py-12">Loading...</p>;
  if (!session || session.user.role !== "admin") {
    return <p className="text-red-500 text-center py-12">Access Denied</p>;
  }

  return (
    <div className="container mx-auto py-12">
      <div className="card">
        <h1 className="text-3xl font-bold mb-4 text-primary">
          Admin Dashboard
        </h1>
        <p className="mb-6 text-secondary">Welcome, {session.user.name}!</p>

        <div className="mb-6">
          <div className="flex border-b">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "teachers"
                  ? "border-b-2 border-primary text-primary"
                  : "text-secondary hover:text-primary"
              }`}
              onClick={() => setActiveTab("teachers")}
            >
              Teachers
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "students"
                  ? "border-b-2 border-primary text-primary"
                  : "text-secondary hover:text-primary"
              }`}
              onClick={() => setActiveTab("students")}
            >
              Students
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "parents"
                  ? "border-b-2 border-primary text-primary"
                  : "text-secondary hover:text-primary"
              }`}
              onClick={() => setActiveTab("parents")}
            >
              Parents
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "classes"
                  ? "border-b-2 border-primary text-primary"
                  : "text-secondary hover:text-primary"
              }`}
              onClick={() => setActiveTab("classes")}
            >
              Classes
            </button>
          </div>
        </div>

        {activeTab === "teachers" && <TeacherManager />}
        {activeTab === "students" && <StudentManager />}
        {activeTab === "parents" && <ParentManager />}
        {activeTab === "classes" && <ClassManager />}
      </div>
    </div>
  );
}
