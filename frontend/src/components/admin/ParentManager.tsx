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

import { useParentManager } from "@/hooks/useParentManager";
import Loader from "@/components/common/Loader";
import { CreateParentModal, EditModal } from "./modals/ParentModal";
import { DeleteModal } from "./modals/DeleteModal";
import { Input } from "../ui/input";

interface ParentManagerProps {
  searchQuery: string;
}

export default function ParentManager({ searchQuery }: ParentManagerProps) {
  const {
    parents,
    editOpen,
    deleteOpen,
    createOpen,
    selectedParent,
    isLoading,
    editForm,
    createForm,
    sortOrder,
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
    setFilterType,
    setFilterValue,
    setSortOrder,
  } = useParentManager(searchQuery);

  const handleSortChange = (value: string) => {
    setSortOrder(value as "asc" | "desc" | null);
  };

  const handleFilterTypeChange = (value: string) => {
    setFilterType(value as "address" | "children" | null);
    setFilterValue(""); // Reset filter value when changing type
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center pt-4">
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
              {/* <SelectItem value="phone">Has Phone</SelectItem> */}
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
              type={filterType === "children" ? "number" : "text"}
            />
          )}
        </div>
        <Button onClick={() => setCreateOpen(true)}>Create Parent</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Children</TableHead>
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
          ) : (
            parents.map((parent) => (
              <TableRow key={parent.id}>
                <TableCell>{parent.fullName}</TableCell>
                <TableCell>{parent.phoneNumber}</TableCell>
                <TableCell>{parent.address}</TableCell>
                {!parent.children?.length && <TableCell></TableCell>}
                <TableCell>
                  {parent.children &&
                    parent.children.map((child) => child.name).join(", ")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => handleEdit(parent)}
                    disabled={isLoading}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(parent)}
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

      <CreateParentModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        form={createForm}
        onSubmit={onCreateSubmit}
        isLoading={isLoading}
      />

      <EditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        form={editForm}
        onSubmit={onEditSubmit}
        isLoading={isLoading}
        selectedParent={selectedParent}
      />
      <DeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={onDeleteConfirm}
        isLoading={false}
        selectedEntity={selectedParent}
        entityName="Parent"
        displayProperty="fullName"
      />
    </>
  );
}
