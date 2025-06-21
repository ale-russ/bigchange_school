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
  console.log("dashboard: ", dashboardData);
  if (isLoading) {
    return <Loader />;
  }

  return (
    <ProtectedRoutes allowedRole="teacher">
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-2xl font-bold mb-4">
                Teacher Dashboard - Total Classes: {dashboardData.totalClasses}
              </h2>
            </CardTitle>
          </CardHeader>

          {dashboardData.totalClasses > 0 ? (
            <CardContent>
              <Tabs
                defaultValue={dashboardData.classes[0]?.id}
                className="w-full"
              >
                <TabsList>
                  {dashboardData.classes.map((cls) => (
                    <TabsTrigger key={cls.id} value={cls.id}>
                      {cls.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {dashboardData.classes.map((cls) => {
                  console.log("class data: ", cls);
                  return (
                    <TabsContent key={cls.id} value={cls.id}>
                      <h3 className="text-xl font-semibold mb-2">
                        Class: {cls.name} - Students: {cls.students.length}
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-bold">
                              Student Name
                            </TableHead>
                            <TableHead>Phone Number</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Parent Name</TableHead>
                            <TableHead>Parent Phone</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dashboardData.studentsByClass[cls.id]?.length > 0 ? (
                            dashboardData.studentsByClass[cls.id].map(
                              (student) => (
                                <TableRow key={student.id}>
                                  <TableCell>{student.name}</TableCell>
                                  <TableCell>
                                    {student.phoneNumber || "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    {student.level || "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    {student.address || "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    {student.parentIds
                                      .map((parent) => parent.fullName)
                                      .join(", ")}
                                  </TableCell>
                                  <TableCell>
                                    {student.parentIds
                                      .map((parent) => parent.phoneNumber)
                                      .join(", ")}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      className="mr-2"
                                      // onClick={() => handleEdit(user)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      // onClick={() => handleDelete(user)}
                                    >
                                      Delete
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            )
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
                  );
                })}
              </Tabs>
            </CardContent>
          ) : (
            <></>
          )}
        </Card>
      </div>
    </ProtectedRoutes>
  );
}
