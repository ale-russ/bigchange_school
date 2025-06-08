"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import TeacherManager from "@/components/admin/TeacherManager";
import ProtectedRoute from "@/components/ProtectedRoutes";
import { useState } from "react";
import StudentManager from "@/components/admin/StudentManager";
import SearchBar from "@/components/common/SearchBar";

export default function AdminDashboard() {
  const tabStyle =
    " data-[state=active]:bg-gray-50 data-[state=active]:text-black data-[state=active]:border data-[state=active]:border-gray-300 rounded-md px-4 py-1 hover:cursor-pointer hover:bg-gray-100 transition-all duration-200 ease-in-out";

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <ProtectedRoute allowedRole="admin">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <SearchBar onSearch={setSearchQuery} />
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users">
              <TabsList className="w-full space-x-3">
                <TabsTrigger value="users" className={tabStyle}>
                  Admin
                </TabsTrigger>
                <TabsTrigger value="students" className={tabStyle}>
                  Students
                </TabsTrigger>
                <TabsTrigger value="parents" className={tabStyle}>
                  Parents
                </TabsTrigger>
                <TabsTrigger value="classes" className={tabStyle}>
                  Classes
                </TabsTrigger>
              </TabsList>
              {/* <div className="w-full bg-primary h-1"/> */}
              <TabsContent value="users">
                <TeacherManager />
              </TabsContent>
              <TabsContent value="students">
                <StudentManager searchQuery={searchQuery} />
              </TabsContent>
              <TabsContent value="parents">
                <TeacherManager />
              </TabsContent>
              <TabsContent value="classes">
                <TeacherManager />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
