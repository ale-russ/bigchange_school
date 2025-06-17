import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useClassManager } from "@/hooks/useClassManager";
import Loader from "@/components/common/Loader";
import { ClassModal } from "./modals/ClassModal";
import { DeleteModal } from "./modals/DeleteModal";
import { useTeacherManager } from "@/hooks/useTeacherManager";

interface ClassManagerProps {
  searchQuery: string;
}

export default function ClassManager({ searchQuery }: ClassManagerProps) {
  const {
    classes,
    students,
    editOpen,
    deleteOpen,
    createOpen,
    selectedClass,
    isLoading,
    editForm,
    createForm,
    handleEdit,
    handleDelete,
    onEditSubmit,
    onDeleteConfirm,
    onCreateSubmit,
    setEditOpen,
    setDeleteOpen,
    setCreateOpen,
  } = useClassManager(searchQuery);
  const { users } = useTeacherManager(searchQuery);

  return (
    <>
      <div className="mb-4 flex justify-end items-center">
        <Button
          onClick={() => setCreateOpen(true)}
          className="hover:cursor-pointer"
        >
          Create Class
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Loader />
              </TableCell>
            </TableRow>
          ) : (
            classes.map((classItem) => (
              <TableRow key={classItem.id}>
                <TableCell>{classItem.name}</TableCell>
                <TableCell>{classItem.level}</TableCell>
                <TableCell>{classItem.teacher?.name ?? "N/A"}</TableCell>
                <TableCell>
                  {classItem.students
                    .map((student) => student.name)
                    .join(", ") || "None"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => handleEdit(classItem)}
                    disabled={isLoading}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(classItem)}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ClassModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        form={createForm}
        onSubmit={onCreateSubmit}
        isLoading={isLoading}
        selectedClass={null}
        mode="create"
        students={students}
        users={users.filter((user) => user.role === "teacher")}
      />
      <ClassModal
        open={editOpen}
        onOpenChange={setEditOpen}
        form={editForm}
        onSubmit={onEditSubmit}
        isLoading={isLoading}
        selectedClass={selectedClass}
        mode="edit"
        students={students}
        users={users.filter((user) => user.role === "teacher")}
      />
      <DeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={onDeleteConfirm}
        isLoading={isLoading}
        selectedEntity={selectedClass}
        entityName="Class"
        displayProperty="name"
      />
    </>
  );
}
