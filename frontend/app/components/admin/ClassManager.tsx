"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import SearchBar from "../ui/SearchBar";
import { Class } from "@/types/auth";
import Table from "../ui/Table";
import ClassForm from "./ClassForm";
import useClassData from "@/app/hooks/useClassData";
import DeleteConfirmationModalModal from "../ui/DeleteConfirmationModal";

export default function ClassManager() {
  const {
    classes,
    teachers,
    students,
    loading,
    error,
    fetchClasses,
    fetchStudents,
  } = useClassData();
  const [modalState, setModalState] = useState<{
    type: "create" | "edit" | "delete" | null;
    classData?: Class | null;
  }>({ type: null });
  const [searchQuery, setSearchQuery] = useState<string>("");

  // const isAdmin = session?.user.role === "admin";

  const handleCreateClass = () => {
    console.log("in handleCreateClass");
    setModalState({
      type: "create",
      classData: {
        id: "",
        name: "",
        level: "",
        teacher: { id: "", name: "", email: "", phoneNumber: "" },
        students: [],
      },
    });
  };

  const handleEditClass = (cls: Class) => {
    setModalState({ type: "edit", classData: cls });
  };

  const handleDeleteClass = (classId: string) => {
    setModalState({
      type: "delete",
      classData: classes.find((c) => c.id === classId),
    });
  };

  const handleCloseModal = () => {
    setModalState({ type: null });
  };

  const handleClassSaved = async () => {
    await fetchClasses();
    await fetchStudents();
    handleCloseModal();
  };

  const handleClassDeleted = async () => {
    await fetchClasses();
    await fetchStudents();
    handleCloseModal();
  };

  const filteredClasses = classes.filter((cls) =>
    [cls.name, cls.teacher.name, cls.teacher.email]
      .filter((field): field is string => typeof field === "string")
      .some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
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
          onClick={handleCreateClass}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
        >
          Create Class
        </button>
      </div>
      <div className="mb-6">
        <SearchBar
          searchQuery={searchQuery}
          handleSearchChange={(e: any) => setSearchQuery(e.target.value)}
        />
      </div>
      {filteredClasses.length === 0 ? (
        <p className="text-secondary mt-4">
          {searchQuery ? "No classes match your search." : "No classes found."}
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
                  className="text-blue-600 hover:underline mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClass(cls.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>,
            ])}
          />
        </div>
      )}

      {modalState.type === "create" ||
        (modalState.type === "edit" && (
          <ClassForm
            classData={modalState.classData!}
            teachers={teachers}
            students={students}
            onSubmit={handleClassSaved}
            onCancel={handleCloseModal}
          />
        ))}
      {modalState.type === "delete" && (
        <DeleteConfirmationModalModal
          itemName={modalState.classData?.name || "class"}
          onConfirm={handleClassDeleted}
          onCancel={handleCloseModal}
          deleteUrl={`/classes/${modalState.classData?.id}`}
        />
      )}
    </div>
  );
}
