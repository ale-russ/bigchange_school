"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import SearchBar from "../ui/SearchBar";
import Modal from "../ui/Modal";
import { Class, User, Student } from "@/types/auth";
import Table from "../ui/Table";

export default function ClassManager() {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [editClass, setEditClass] = useState<Class | null>(null);
  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [classSearchQuery, setClassSearchQuery] = useState<string>("");
  const [classFormData, setClassFormData] = useState({
    name: "",
    teacherId: "",
    level: "",
    studentIds: [] as string[],
  });

  useEffect(() => {
    if (session?.accessToken) {
      fetchClasses();
      fetchTeachers();
      fetchStudents();
    }
  }, [session]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/classes`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      setClasses(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch classes");
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/users`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
          params: { role: "teacher" },
        }
      );

      setTeachers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch teachers");
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/students`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      setStudents(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed To Fetch Students");
    }
  };

  const handleEditClass = (cls: Class) => {
    setEditClass(cls);
    setClassFormData({
      name: cls.name || "",
      level: cls.level || "",
      teacherId: cls.teacher.id || "",
      studentIds: cls.students.map((s) => s.id) || [],
    });
  };

  const handleCreateOrUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!session?.accessToken) {
      setFormError("Session not found");
      setLoading(false);
      return;
    }

    try {
      let response: any;
      if (editClass?.id) {
        response = await axios.put(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/classes/${editClass.id}`,
          classFormData,
          {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }
        );
        setClasses(
          classes.map((c) => (c.id === editClass.id ? response.data : c))
        );
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/classes`,
          classFormData,
          {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }
        );
        setClasses([...classes, response.data]);
      }
      setEditClass(null);
      setClassFormData({ name: "", teacherId: "", studentIds: [], level: "" });
      setFormError("");
      await fetchStudents();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to save class");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async () => {
    setLoading(true);
    if (!deleteClassId || !session?.accessToken) return;
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/classes/${deleteClassId}`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      setClasses(classes.filter((c) => c.id !== deleteClassId));
      setDeleteClassId(null);
      await fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete class");
    } finally {
      setLoading(false);
    }
  };

  const handleClassInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "studentIds") {
      if (e.target instanceof HTMLSelectElement) {
        const options = e.target.options;
        const selected: string[] = [];
        for (let i = 0; i < options.length; i++) {
          if (options[i].selected) {
            selected.push(options[i].value);
          }
        }
        setClassFormData((prev) => ({ ...prev, studentIds: selected }));
      }
    } else {
      setClassFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleClassSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClassSearchQuery(e.target.value);
  };

  const filteredClasses = classes.filter((cls) =>
    [cls.name, cls.teacher.name, cls.teacher.email]
      .filter((field): field is string => typeof field === "string")
      .some((field) =>
        field.toLowerCase().includes(classSearchQuery.toLowerCase())
      )
  );

  if (loading) return <p className="text-center py-12">Loading...</p>;
  if (error) return <p className="text-red-500 text-center py-12">{error}</p>;

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold mb-4 text-secondary">
          Manage Classes
        </h2>
        <button
          onClick={() =>
            setEditClass({
              id: "",
              name: "",
              level: "",
              teacher: { id: "", name: "", email: "", phoneNumber: "" },
              students: [],
            })
          }
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
        >
          Create Class
        </button>
      </div>
      <div className="mb-6">
        <SearchBar
          searchQuery={classSearchQuery}
          handleSearchChange={(e: any) => setClassSearchQuery(e.target.value)}
        />
      </div>
      {filteredClasses.length === 0 ? (
        <p className="text-secondary mt-4">
          {classSearchQuery
            ? "No classes match your search."
            : "No classes found."}
        </p>
      ) : (
        <div className="table-responsive mt-4">
          <Table
            headers={[
              "Name",
              "Teacher",
              "Phone number",
              "Level",
              "No Students",
              "Actions",
            ]}
            rows={filteredClasses.map((cls) => [
              cls.name,
              `${cls.teacher.name}`,
              `${cls.teacher.phoneNumber}`,
              `${cls.level}`,
              `${cls.students.length}`,
              <div key={cls.id}>
                <button
                  onClick={() => handleEditClass(cls)}
                  className="text-primary hover:underline mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteClassId(cls.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>,
            ])}
          />
        </div>
      )}

      {/* Create/Edit Class Modal */}
      <Modal
        isOpen={!!editClass}
        onClose={() => {
          setEditClass(null);
          setFormError("");
        }}
        title={editClass?.id ? "Edit Class" : "Create Class"}
      >
        <form onSubmit={handleCreateOrUpdateClass} className="space-y-4">
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-secondary"
            >
              Class Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={classFormData.name}
              onChange={handleClassInputChange}
              className="mt-1 block w-full p-3 border rounded-md focus:ring-primary focus:border-primary"
              required={editClass?.id ? false : true}
            />
          </div>
          <div>
            <label
              htmlFor="level"
              className="block text-sm font-medium text-gray-700"
            >
              Level
            </label>
            <input
              type="text"
              id="level"
              name="level"
              value={classFormData.level}
              onChange={handleClassInputChange}
              className="mt-1 block w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required={editClass?.id ? false : true}
            />
          </div>
          <div>
            <label
              htmlFor="teacherId"
              className="block text-sm font-medium text-secondary"
            >
              Teacher
            </label>
            <select
              id="teacherId"
              name="teacherId"
              value={classFormData.teacherId}
              onChange={handleClassInputChange}
              className="mt-1 block w-full p-3 border rounded-md focus:ring-primary focus:border-primary"
              required={editClass?.id ? false : true}
            >
              <option value="">Select Teacher</option>
              {teachers.map((teacher) => {
                return (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.phoneNumber})
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label
              htmlFor="studentIds"
              className="block text-sm font-medium text-secondary"
            >
              Students
            </label>
            <select
              id="studentIds"
              name="studentIds"
              multiple
              value={classFormData.studentIds}
              onChange={handleClassInputChange}
              className="mt-1 block w-full p-3 border rounded-md focus:ring-primary focus:border-primary"
            >
              {students.map((student) => {
                console.log("student: ", student);
                return (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.phoneNumber})
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setEditClass(null);
                setFormError("");
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Class Modal */}
      <Modal
        isOpen={!!deleteClassId}
        onClose={() => setDeleteClassId(null)}
        title="Confirm Deletion"
      >
        <p className="mb-4 text-secondary">
          Are you sure you want to delete this class? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setDeleteClassId(null)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteClass}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
