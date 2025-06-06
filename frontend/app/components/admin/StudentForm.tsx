"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

import { Student, Class, Parent } from "@/types/auth";
import Modal from "../ui/Modal";
import MultiSelectCheckbox from "../ui/MultiSelectCheckbox";

interface StudentFormProps {
  student: Student | null;
  classes: Class[];
  parents: Parent[];
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  onParentCreated?: (newParent: Parent) => void;
}

export default function StudentForm({
  student,
  classes,
  parents,
  onSubmit,
  onCancel,
  onParentCreated,
}: StudentFormProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: student?.name || "",
    phoneNumber: student?.phoneNumber || "",
    address: student?.address || "",
    level: student?.level,
    classId: student?.class?.id || "",
    parentIds: student?.parentIds || [],
  });

  const [parentFormData, setParentFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
  });
  const [showParentModal, setShowParentModal] = useState(false);
  const [parentFormError, setParentFormError] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "classId" ? (value === "" ? null : value) : value,
    }));
  };

  const handleParentSelection = (parentIds: string[]) => {
    setFormData((prev) => ({ ...prev, parentIds }));
  };

  const handleParentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParentFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) {
      setParentFormError("Session not found");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parents`,
        { ...parentFormData, childrenIds: [] },
        { headers: { Authorization: `Bearer ${session.accessToken}` } }
      );
      const newParent: Parent = response.data;
      onParentCreated?.(newParent);
      setFormData((prev) => ({
        ...prev,
        parentIds: [...prev.parentIds, newParent.id],
      }));
      setParentFormData({ fullName: "", phoneNumber: "", address: "" });
      setParentFormError("");
      setShowParentModal(false);
    } catch (err: any) {
      setParentFormError(
        err.response?.data?.message || "Failed to create parent"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.parentIds.length === 0) {
      setError("At least one parent must be selected");
      return;
    }
    try {
      const url = student?.id ? `/students/${student.id}` : `/students`;
      const method = student?.id ? "put" : "post";
      await axios[method](
        `${process.env.NEXT_PUBLIC_SERVER_URL}${url}`,
        formData,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      await onSubmit();
    } catch (err: any) {
      setError("Failed to save student");
    }
  };
  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={student?.id ? "Edit Student" : "Add Student"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="level"
            className="block text-sm font-medium text-gray-700"
          >
            Level
          </label>
          <input
            type="text"
            id="level"
            name="level"
            value={formData.level}
            onChange={handleInputChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="classId"
            className="block text-sm font-medium text-gray-700"
          >
            Class
          </label>
          <select
            id="classId"
            name="classId"
            value={formData.classId}
            onChange={handleInputChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={student?.class ? student.class.id : ""}>
              {student?.class ? student.class.name : "Select Class"}
            </option>
            {classes
              .filter((cls) => {
                return cls.id !== student?.class?.id;
              })
              .map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Parents
          </label>
          <div className="flex items-center space-x-2">
            <div className="w-full">
              <MultiSelectCheckbox
                options={parents.map((p) => ({
                  id: p.id,
                  label: `${p.fullName} (${p.phoneNumber || "No phone"})`,
                }))}
                selectedIds={formData.parentIds}
                onChange={handleParentSelection}
                placeholder="Select Parents"
                itemName="Parent"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowParentModal(true)}
              className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add New Parent
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
      {/* Create Parent Modal */}
      <Modal
        isOpen={showParentModal}
        onClose={() => {
          setShowParentModal(false);
          setParentFormError("");
        }}
        title="Add New Parent"
      >
        <form onSubmit={handleCreateParent} className="space-y-4">
          {parentFormError && (
            <p className="text-red-500 text-sm">{parentFormError}</p>
          )}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={parentFormData.fullName}
              onChange={handleParentInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={parentFormData.phoneNumber}
              onChange={handleParentInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={parentFormData.address}
              onChange={handleParentInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowParentModal(false);
                setParentFormError("");
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Create Parent
            </button>
          </div>
        </form>
      </Modal>
    </Modal>
  );
}
