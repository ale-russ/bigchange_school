"use client";

import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
          <button
            className="text-gray-500 hover:text-gray-700 hover:cursor-pointer"
            onClick={onClose}
            aria-label="Close modal"
          >
            <div className="rounded-full h-8 w-8 border border-gray-200 justify-center flex items-center">
              x
            </div>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
