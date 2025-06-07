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
import { Student } from "@/lib/types";

const mockStudents: Student[] = [
  {
    studentId: "1",
    name: "John Doe",
    classId: "class1",
    level: "Grade 9",
    isUnassigned: false,
    phoneNumber: "",
    parentIds: [],
    address: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    studentId: "2",
    name: "Jane Smith",
    phoneNumber: "123-456-7890",
    level: "Grade 10",
    isUnassigned: true,
    parentIds: [],
    address: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStudents.map((student) => (
                <TableRow key={student.studentId}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.classId || "Unassigned"}</TableCell>
                  <TableCell>{student.level}</TableCell>
                  <TableCell>
                    <Button variant="outline" className="mr-2">
                      Edit
                    </Button>
                    <Button variant="destructive">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
