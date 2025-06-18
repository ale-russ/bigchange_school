import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useStudentManager } from "@/hooks/useStudentManager";
import { EditModal, CreateStudentModal } from "./modals/StudentModals";
import { DeleteModal } from "./modals/DeleteModal";
import { CreateParentModal } from "./modals/ParentModal";
import Loader from "../common/Loader";
import { Input } from "../ui/input";

interface StudentManagerProps {
  searchQuery: string;
}

export default function StudentManager({ searchQuery }: StudentManagerProps) {
  const {
    students,
    classes,
    parents,
    editOpen,
    deleteOpen,
    createOpen,
    createParentOpen,
    selectedStudent,
    isLoading,
    editForm,
    createForm,
    createParentForm,
    filterType,
    filterValue,
    handleEdit,
    handleDelete,
    onEditSubmit,
    onDeleteConfirm,
    onCreateSubmit,
    onCreateParentSubmit,
    setEditOpen,
    setDeleteOpen,
    setCreateOpen,
    setCreateParentOpen,
    setSortOrder,
    setFilterType,
    setFilterValue,
  } = useStudentManager(searchQuery);

  const handleSortChange = (value: string) => {
    setSortOrder(value as "asc" | "desc" | null);
  };

  const handleFilterTypeChange = (value: string) => {
    setFilterType(value as "phoneNumber" | "address" | "level" | null);
    setFilterValue(""); // Reset filter value when changing type
  };
  return (
    <>
      <div className="mb-4 flex justify-between items-center pt-2">
        <div className="flex gap-4">
          <Select onValueChange={handleSortChange} defaultValue="">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">A-Z</SelectItem>
              <SelectItem value="desc">Z-A</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={handleFilterTypeChange} defaultValue="">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="address">Address</SelectItem>
              <SelectItem value="children">Children</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
          {filterType && (
            <Input
              placeholder={`Enter ${
                filterType === "address" ? "address" : "number of children"
              } ...`}
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-[200px]"
              // type={filterType === "children" ? "number" : "text"}
            />
          )}
        </div>
        <Button onClick={() => setCreateOpen(true)}>Create Student</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Parents</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Loader />
              </TableCell>
            </TableRow>
          ) : students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>No students found.</TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.phoneNumber || "N/A"}</TableCell>
                <TableCell>
                  {student.parentIds
                    .map((id) => parents.find((p) => p.id === id)?.fullName)
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </TableCell>
                <TableCell>{student.level || "N/A"}</TableCell>
                <TableCell>{student.address || "N/A"}</TableCell>
                <TableCell>{student.class?.name || "Unassigned"}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => handleEdit(student)}
                    disabled={isLoading}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(student)}
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
      <EditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        form={editForm}
        onSubmit={onEditSubmit}
        isLoading={isLoading}
        classes={classes}
        parents={parents}
        selectedStudent={selectedStudent}
      />
      <DeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={onDeleteConfirm}
        isLoading={false}
        selectedEntity={selectedStudent}
        entityName="Student"
        displayProperty="name" // Default, so optional
      />
      <CreateStudentModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        form={createForm}
        onSubmit={onCreateSubmit}
        isLoading={isLoading}
        classes={classes}
        parents={parents}
        setCreateParentOpen={setCreateParentOpen}
      />
      <CreateParentModal
        open={createParentOpen}
        onOpenChange={setCreateParentOpen}
        form={createParentForm}
        onSubmit={onCreateParentSubmit}
        isLoading={isLoading}
      />
    </>
  );
}
