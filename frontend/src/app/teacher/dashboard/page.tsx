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
import { Class } from "@/lib/types";
import { toast } from "sonner";
import ProtectedRoutes from "@/components/ProtectedRoutes";

// Mock data (replace with API call)
const mockClasses: Class[] = [
  {
    classId: "class1",
    name: "Math 101",
    teacherId: "teacher1",
    studentIds: ["1", "2"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    classId: "class2",
    name: "Science 102",
    teacherId: "teacher1",
    studentIds: ["3"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function TeacherDashboard() {
  const handleRemoveStudent = (studentId: string, classId: string) => {
    toast("Student removed");
  };

  const handleEditStudent = (studentId: string) => {
    toast("Edit student functionality not implemented yet");
  };

  return (
    <ProtectedRoutes allowedRole="teacher">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        {mockClasses.length === 0 ? (
          <p>No classes assigned.</p>
        ) : (
          mockClasses.map((classItem) => (
            <Card key={classItem.classId}>
              <CardHeader>
                <CardTitle>{classItem.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classItem.studentIds.map((studentId) => (
                      <TableRow key={studentId}>
                        <TableCell>Student {studentId}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            className="mr-2"
                            onClick={() => handleEditStudent(studentId)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              handleRemoveStudent(studentId, classItem.classId)
                            }
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ProtectedRoutes>
  );
}
