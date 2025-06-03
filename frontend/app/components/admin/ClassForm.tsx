"use client";

import { useState } from "react";
import { Class, User, Student } from "@/types/auth";

interface ClassFormProps {
  classData: Class | null;
  teachers: User[];
  students: Student[];
  onSubmit: (data: {
    name: string;
    teacherId: string;
    studentIds: string[];
  }) => Promise<void>;
  onCancel: () => void;
  error: string;
}

export default function ClassForm({
  classData,
  teachers,
  students,
  onSubmit,
  onCancel,
  error,
}: ClassFormProps) {
  const [formData, setFormData] = useState({
    name: classData?.name || "",
    teacherId: classData?.teacher.id || "",
    studentIds: classData?.students.map((s) => s.id) || [],
  });

  const handleInputChange = (
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
        setFormData((prev) => ({ ...prev, studentIds: selected }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
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
          htmlFor="teacherId"
          className="block text-sm font-medium text-gray-700"
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
              {teacher.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="studentIds"
          className="block text-sm font-medium text-gray-700"
        >
          Students
        </label>
        <select
          id="studentIds"
          name="studentIds"
          multiple
          value={formData.studentIds}
          onChange={handleInputChange}
          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
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
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  );
}
