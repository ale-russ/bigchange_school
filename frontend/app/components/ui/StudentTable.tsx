"use client";

import { Student, Parent } from "@/types/auth";

interface StudentTableProps {
  students: Student[];
  parents: Parent[];
  onEdit: (student: Student) => void;
  onDelete?: (studentId: string) => void;
}

export default function StudentTable({
  students,
  parents,
  onEdit,
  onDelete,
}: StudentTableProps) {
  return (
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
          {students.map((student) => (
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
              <td className="p-3 space-x-2">
                <button
                  onClick={() => onEdit(student)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(student.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
