"use client";

import { useState, useEffect } from "react";

import SearchBar from "../ui/SearchBar";
import { Student } from "@/types/auth";
import StudentForm from "./StudentForm";
import useStudentData from "@/app/hooks/useStudentData";
import StudentTable from "../ui/StudentTable";
import DeleteConfirmationModal from "../ui/DeleteConfirmationModal";

export default function StudentManager() {
  const {
    students,
    classes,
    parents,
    loading,
    error,
    fetchStudents,
    fetchParents,
  } = useStudentData();
  const [modalState, setModalState] = useState<{
    type: "create" | "edit" | "delete" | null;
    studentData?: Student | null;
  }>({ type: null });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [phoneFilter, setPhoneFilter] = useState<"all" | "has" | "none">("all");

  // const isAdmin = session?.user.role === "admin";

  const handleCreateStudent = () => {
    setModalState({ type: "create", studentData: null });
  };

  const handleEditStudent = (student: Student) => {
    setModalState({ type: "edit", studentData: student });
  };

  const handleDeleteStudent = (studentId: string) => {
    setModalState({
      type: "delete",
      studentData: students.find((s) => s.id === studentId),
    });
  };

  const handleCloseModal = () => setModalState({ type: null });

  const handleStudentSaved = async () => {
    await fetchStudents();
    handleCloseModal();
  };

  const handleParentCreated = async () => {
    await fetchParents();
    handleCloseModal();
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = searchQuery
      ? [student.name, student.phoneNumber, student.address, student.level]
          .filter((field): field is string => typeof field === "string")
          .some((field) =>
            field?.toLowerCase().includes(searchQuery.toLowerCase())
          )
      : true;
    const matchesPhoneFilter =
      phoneFilter === "all" ||
      (phoneFilter === "has" && student.phoneNumber) ||
      (phoneFilter === "none" && !student.phoneNumber);
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
          onClick={handleCreateStudent}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
        >
          Add Student
        </button>
      </div>
      <div className="mb-6 flex flex-col gap-4">
        <SearchBar
          searchQuery={searchQuery}
          handleSearchChange={(e: any) => setSearchQuery(e.target.value)}
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
            value={phoneFilter}
            onChange={(e) =>
              setPhoneFilter(e.target.value as "all" | "has" | "none")
            }
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
          {searchQuery || phoneFilter !== "all"
            ? "No students match your search or filter"
            : "No students found"}
        </p>
      ) : (
        <StudentTable
          students={filteredStudents}
          parents={parents}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
        />
        // <div className="table-responsive mt-4">
        //   <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
        //     <thead className="bg-gray-100">
        //       <tr>
        //         <th className="p-3 text-left text-sm font-medium text-secondary">
        //           Name
        //         </th>
        //         <th className="p-3 text-left text-sm font-medium text-secondary">
        //           Phone
        //         </th>
        //         <th className="p-3 text-left text-sm font-medium text-secondary">
        //           Address
        //         </th>
        //         <th className="p-3 text-left text-sm font-medium text-secondary">
        //           Level
        //         </th>
        //         <th className="p-3 text-left text-sm font-medium text-secondary">
        //           Class
        //         </th>
        //         <th className="p-3 text-left text-sm font-medium text-secondary">
        //           Parents
        //         </th>
        //         <th className="p-3 text-left text-sm font-medium text-secondary">
        //           Actions
        //         </th>
        //       </tr>
        //     </thead>
        //     <tbody>
        //       {filteredStudents.map((student) => {
        //         return (
        //           <tr key={student.id} className="border-b hover:bg-gray-50">
        //             <td className="p-3">{student.name}</td>
        //             <td className="p-3">{student.phoneNumber || "N/A"}</td>
        //             <td className="p-3">{student.address || "N/A"}</td>
        //             <td className="p-3">{student.level || "N/A"}</td>
        //             <td className="p-3">{student.class?.name || "N/A"}</td>
        //             <td className="p-3">
        //               {student.parentIds
        //                 .map((id) => parents.find((p) => p.id === id)?.fullName)
        //                 .filter(Boolean)
        //                 .join(", ") || "N/A"}
        //             </td>
        //             <td className="p-3">
        //               <button
        //                 onClick={() => handleEditStudent(student)}
        //                 className="text-blue-600 hover:underline mr-2 hover:cursor-pointer"
        //               >
        //                 Edit
        //               </button>
        //               <button
        //                 onClick={() => setDeleteStudentId(student.id)}
        //                 className="text-red-600 hover:underline hover:cursor-pointer"
        //               >
        //                 Delete
        //               </button>
        //             </td>
        //           </tr>
        //         );
        //       })}
        //     </tbody>
        //   </table>
        // </div>
      )}

      {(modalState.type === "create" || modalState.type === "edit") && (
        <StudentForm
          student={modalState.studentData ?? null}
          classes={classes}
          parents={parents}
          onSubmit={handleStudentSaved}
          onCancel={handleCloseModal}
          onParentCreated={
            modalState.type === "create" ? handleParentCreated : undefined
          }
        />
      )}
      {modalState.type === "delete" && (
        <DeleteConfirmationModal
          itemName={modalState.studentData?.name || "student"}
          onConfirm={handleStudentSaved}
          onCancel={handleCloseModal}
          deleteUrl={`/api/students/${modalState.studentData?.id}`}
        />
      )}
    </div>
  );
}
