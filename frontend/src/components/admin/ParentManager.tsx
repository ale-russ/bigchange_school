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

import { useParentManager } from "@/hooks/useParentManager";
import Loader from "@/components/common/Loader";
import { CreateParentModal, EditModal } from "./modals/ParentModal";
import { DeleteModal } from "./modals/DeleteModal";

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
    handleEdit,
    handleDelete,
    onEditSubmit,
    onDeleteConfirm,
    onCreateSubmit,
    setEditOpen,
    setDeleteOpen,
    setCreateOpen,
  } = useParentManager(searchQuery);

  return (
    <>
      <div className="mb-4 flex justify-end items-center">
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
                {parent.children?.map((child) => (
                  <TableCell key={child.id}>
                    {child.name || "Not AVailable"}
                  </TableCell>
                ))}
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
