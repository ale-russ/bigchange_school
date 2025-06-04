"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import SearchBar from "../ui/SearchBar";
import Modal from "../ui/Modal";
import { Student, Class, Parent } from "@/types/auth";
import StudentForm from "./StudentForm";

export default function StudentManager() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);

  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null);

  const [createStudent, setCreateStudent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  const [studentSearchQuery, setStudentSearchQuery] = useState<string>("");
  const [studentPhoneFilter, setStudentPhoneFilter] = useState<string>("all");
  const [studentFormData, setStudentFormData] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    classId: "",
    level: "",
    parentIds: [] as string[],
  });

  useEffect(() => {
    console.log("session: ", session);
    if (session?.accessToken) {
      fetchStudents();
      fetchClasses();
      fetchParents();
    }
  }, [session]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/students`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      setStudents(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch students");
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/classes`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      setClasses(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch classes");
    }
  };

  const fetchParents = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parents`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      console.log("response: ", response.data);
      setParents(response.data);
    } catch (err) {
      setError("Failed to fetch parents");
    }
  };

  const handleCreateStudent = async (data: Partial<Student>) => {
    if (!session?.accessToken) {
      setFormError("Session not found");
      return;
    }
    console.log("parentId: ", data);
    if (!data?.parentIds || data.parentIds?.length === 0) {
      setFormError("Please select at least one parent");
      return;
    }
    console.log("data: ", data);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/students`,
        data,
        { headers: { Authorization: `Bearer ${session.accessToken}` } }
      );
      setStudents([...students, response.data]);
      setCreateStudent(false);
      setError("");
    } catch (err: any) {
      console.log("Error: ", err);
      setFormError(err.response?.message || "Failed To Create Student");
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditStudent(student);
    setStudentFormData({
      name: student.name || "",
      phoneNumber: student.phoneNumber || "",
      address: student.address || "",
      level: "",
      classId: student.class?.id || "",
      parentIds: student.parentIds || [],
    });
  };

  const handleUpdateStudent = async (data: Partial<Student>) => {
    console.log("on handleUpdateStudent", data);
    setLoading(true);
    if (!editStudent || !session?.accessToken) {
      setFormError("Session not found");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/students/${editStudent.id}`,
        data,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      setStudents(
        students.map((s) => (s.id === editStudent.id ? response.data : s))
      );
      setEditStudent(null);
      setStudentFormData({
        name: "",
        phoneNumber: "",
        address: "",
        level: "",
        classId: "",
        parentIds: [],
      });
      setFormError("");
      // await fetchClasses();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to update student");
      await fetchStudents();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    setLoading(true);
    if (!deleteStudentId || !session?.accessToken) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_NEXT_PUBLIC_SERVER_URL}/students/${deleteStudentId}`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      setStudents(students.filter((s) => s.id !== deleteStudentId));
      setDeleteStudentId(null);
      // await fetchClasses();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete student");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "parentIds") {
      if (e.target instanceof HTMLSelectElement) {
        const options = e.target.options;
        const selected: string[] = [];
        for (let i = 0; i < options.length; i++) {
          if (options[i].selected) selected.push(options[i].value);
        }
        setStudentFormData((prev) => ({ ...prev, parentIds: selected }));
      }
    } else {
      setStudentFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleParentCreated = (newParent: Parent) => {
    setParents((prev) => [...prev, newParent]);
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = studentSearchQuery
      ? [student.name, student.phoneNumber, student.address]
          .filter((field): field is string => typeof field === "string")
          .some((field) =>
            field.toLowerCase().includes(studentSearchQuery.toLowerCase())
          )
      : true;

    const matchesPhoneFilter =
      studentPhoneFilter === "all" ||
      (studentPhoneFilter === "has" && student.phoneNumber) ||
      (studentPhoneFilter === "none" && !student.phoneNumber);
    return matchesSearch && matchesPhoneFilter;
  });

  if (loading) return <p className="text-center py-12">Loading...</p>;
  if (error) return <p className="text-red-500 text-center py-12">{error}</p>;

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold mb-4 text-secondary">
          Manage Students
        </h2>
        <button
          onClick={() => setCreateStudent(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
        >
          Add Student
        </button>
      </div>
      <div className="mb-6 flex flex-col gap-4">
        <SearchBar
          searchQuery={studentSearchQuery}
          handleSearchChange={(e: any) => setStudentSearchQuery(e.target.value)}
        />
        <div>
          <label
            htmlFor="phoneFilter"
            className="block text-sm font-medium text-secondary mb-1"
          >
            Phone Number
          </label>
          <select
            id="phoneFilter"
            value={studentPhoneFilter}
            onChange={(e) => setStudentPhoneFilter(e.target.value)}
            className="p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          >
            <option value="all">All</option>
            <option value="has">Has Phone</option>
            <option value="none">No Phone</option>
          </select>
        </div>
      </div>
      {filteredStudents.length === 0 ? (
        <p className="text-secondary mt-4">
          {studentSearchQuery || studentPhoneFilter !== "all"
            ? "No students match your search or filter"
            : "No students found"}
        </p>
      ) : (
        <div className="table-responsive mt-4">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-secondary">
                  Name
                </th>
                <th className="p-3 text-left text-sm font-medium text-secondary">
                  Phone
                </th>
                <th className="p-3 text-left text-sm font-medium text-secondary">
                  Address
                </th>
                <th className="p-3 text-left text-sm font-medium text-secondary">
                  Level
                </th>
                <th className="p-3 text-left text-sm font-medium text-secondary">
                  Class
                </th>
                <th className="p-3 text-left text-sm font-medium text-secondary">
                  Parents
                </th>
                <th className="p-3 text-left text-sm font-medium text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                console.log("student: ", student);
                return (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{student.name}</td>
                    <td className="p-3">{student.phoneNumber || "N/A"}</td>
                    <td className="p-3">{student.address || "N/A"}</td>
                    <td className="p-3">{student.level || "N/A"}</td>
                    <td className="p-3">{student.class?.name || "N/A"}</td>
                    <td className="p-3">
                      {student.parentIds
                        .map((id) => parents.find((p) => p.id === id)?.fullName)
                        .filter(Boolean)
                        .join(", ") || "N/A"}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="text-primary hover:underline mr-2 hover:cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteStudentId(student.id)}
                        className="text-red-600 hover:underline hover:cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Student Modal */}
      <Modal
        isOpen={createStudent}
        onClose={() => {
          setCreateStudent(false);
          setFormError("");
        }}
        title="Add Student"
      >
        <StudentForm
          student={null}
          classes={classes}
          parents={parents}
          onSubmit={async (data) => {
            await handleCreateStudent({
              preventDefault: () => {},
              ...data,
            } as any);
          }}
          onCancel={() => setCreateStudent(false)}
          error={formError}
          onParentCreated={handleParentCreated}
        />
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={!!editStudent}
        onClose={() => {
          setEditStudent(null);
          setFormError("");
        }}
        title="Edit Student"
      >
        <StudentForm
          student={editStudent}
          classes={classes}
          onSubmit={handleUpdateStudent}
          onCancel={() => setEditStudent(null)}
          error={formError}
          parents={parents?.filter((parent) =>
            editStudent?.parentIds.includes(parent.id)
          )}
          onParentCreated={function (newParent: Parent): void {
            throw new Error("Function not implemented.");
          }}
        />
      </Modal>

      <Modal
        isOpen={!!deleteStudentId}
        onClose={() => setDeleteStudentId(null)}
        title="Confirm Deletion"
      >
        <p className="mb-4 text-secondary">
          Are you sure you want to delete this student? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setDeleteStudentId(null)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteStudent}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:cursor-pointer"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
