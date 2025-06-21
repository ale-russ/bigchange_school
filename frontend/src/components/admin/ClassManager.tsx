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
import { useClassManager } from "@/hooks/useClassManager";
import Loader from "@/components/common/Loader";
import { ClassModal } from "./modals/ClassModal";
import { DeleteModal } from "./modals/DeleteModal";
import { useTeacherManager } from "@/hooks/useTeacherManager";
import { Input } from "../ui/input";

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
    filterType,
    filterValue,
    handleEdit,
    handleDelete,
    onEditSubmit,
    onDeleteConfirm,
    onCreateSubmit,
    setEditOpen,
    setDeleteOpen,
    setCreateOpen,
    setSortOrder,
    setFilterType,
    setFilterValue,
  } = useClassManager(searchQuery);
  const { users } = useTeacherManager(searchQuery);

  const handleSortChange = (value: string) => {
    setSortOrder(value as "asc" | "desc" | null);
  };

  const handleFilterTypeChange = (value: string) => {
    setFilterType(value as "phoneNumber" | "address" | "level" | null);
    setFilterValue(""); // Reset filter value when changing types
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center pt-4">
        <div className="flex gap-4">
          {/* <Select onValueChange={handleSortChange} defaultValue="">
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
              <SelectItem value="phone">Has Phone</SelectItem>
              <SelectItem value="address">Address</SelectItem>
              <SelectItem value="level">Level</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
          {filterType && filterType !== "phoneNumber" && (
            <Input
              placeholder={`Enter ${filterType}...`}
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-[200px]"
            />
          )} */}
        </div>
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
                  {/* {classItem.students
                    .map((student) => student.name)
                    .join(", ") || "None"} */}
                  {classItem.students.length ?? "None"}
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
