import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteModalProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
  selectedEntity: T | null;
  entityName?: string; // Optional custom label (e.g., "Student", "Parent", "Teacher")
  displayProperty?: keyof T & ("name" | "fullName"); // Restrict to common name properties
}

export function DeleteModal<T>({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  selectedEntity,
  entityName = "item",
  displayProperty,
}: DeleteModalProps<T>) {
  const displayValue =
    selectedEntity && displayProperty && selectedEntity[displayProperty]
      ? (selectedEntity[displayProperty] as string)
      : "this item";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>
            Are you sure you want to delete {displayValue}? This action cannot
            be undone.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            Delete {entityName}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
