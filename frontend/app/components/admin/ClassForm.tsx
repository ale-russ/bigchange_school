"use client";

import { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Modal from "../ui/Modal";
import { Class, User, Student } from "@/types/auth";
import MultiSelectCheckbox from "../ui/MultiSelectCheckbox";

interface ClassFormProps {
  classData: Class;
  teachers: User[];
  students: Student[];
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export default function ClassForm({
  classData,
  teachers,
  students,
  onSubmit,
  onCancel,
}: ClassFormProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: classData.name || "",
    level: classData.level || "",
    teacherId: classData.teacher.id || "",
    studentIds: classData.students.map((s) => s.id) || [],
  });
  const [error, setError] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentSelection = (studentIds: string[]) => {
    setFormData((prev) => ({ ...prev, studentIds }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) {
      setError("Session not found");
      return;
    }

    try {
      const url = classData.id ? `/classes/${classData.id}` : `/classes`;
      const method = classData.id ? "put" : "post";
      await axios[method](
        `${process.env.NEXT_PUBLIC_SERVER_URL}${url}`,
        formData,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      await onSubmit();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save class");
    }
  };
  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={classData.id ? "Edit Class" : "Create Class"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
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
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="level"
            className="block text-sm font-medium text-secondary"
          >
            Level
          </label>
          <input
            type="text"
            id="level"
            name="level"
            value={formData.level}
            onChange={handleInputChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
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
            value={formData.teacherId}
            onChange={handleInputChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} ({teacher.phoneNumber || "No phone"})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary">
            Students
          </label>
          <MultiSelectCheckbox
            options={students.map((s) => ({
              id: s.id,
              label: `${s.name} (${s.phoneNumber || "No phone"})`,
            }))}
            selectedIds={formData.studentIds}
            onChange={handleStudentSelection}
            placeholder="Select Students"
            itemName="Student"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
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
  );
}
