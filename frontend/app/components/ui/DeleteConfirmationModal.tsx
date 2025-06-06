"use client";

import { useSession } from "next-auth/react";
import axios from "axios";
import Modal from "./Modal";
import { useState } from "react";

interface DeleteConfirmationModalProps {
  itemName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  deleteUrl: string;
}

export default function DeleteConfirmationModalModal({
  itemName,
  onConfirm,
  onCancel,
  deleteUrl,
}: DeleteConfirmationModalProps) {
  const { data: session } = useSession();
  const [error, setError] = useState<string>("");

  const handleDelete = async () => {
    if (!session?.accessToken) {
      setError("Session not found. Please log in again.");
      return;
    }

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/${deleteUrl}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      await onConfirm();
    } catch (err: any) {
      setError(`Failed to delete ${itemName}. Please try again`);
    }
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title="Confirm Deletion">
      <p className="mb-4 text-secondary">
        Are you sure you want to delete <strong>{itemName}</strong>? This action
        cannot be undone.
      </p>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}
