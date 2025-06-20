"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Class, Student } from "@/lib/types";
import { toast } from "sonner";
import ProtectedRoutes from "@/components/ProtectedRoutes";
import { useTeacherDashboard } from "@/hooks/useTeacherDashboard";
import Loader from "@/components/common/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TeacherDashboardProps {
  teacherId: string;
}

export default function TeacherDashboard({ teacherId }: TeacherDashboardProps) {
  const { dashboardData, isLoading } = useTeacherDashboard(teacherId);

  // if (isLoading) {
  //   return <Loader />;
  // }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Teacher Dashboard - Total Classes: {dashboardData.totalClasses}
      </h2>
      {dashboardData.totalClasses > 0 ? (
        <>
          <Tabs defaultValue={dashboardData.classes[0]?.id} className="w-full">
            <TabsList>
              {dashboardData.classes.map((cls) => (
                <TabsTrigger key={cls.id} value={cls.id}>
                  {cls.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {dashboardData.classes.map((cls) => (
              <TabsContent key={cls.id} value={cls.id}>
                <h3 className="text-xl font-semibold mb-2">
                  Class: {cls.name} - Students:{" "}
                  {dashboardData.studentsByClass[cls.id]?.length || 0}
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.studentsByClass[cls.id]?.length > 0 ? (
                      dashboardData.studentsByClass[cls.id].map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.phoneNumber || "N/A"}</TableCell>
                          <TableCell>{student.address || "N/A"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3}>
                          No students in this class.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
