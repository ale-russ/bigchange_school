"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import SearchBar from "../ui/SearchBar";
import Modal from "../ui/Modal";
import { Parent, Student, Session } from "@/types/auth";

export default function ParentManager() {
  const { data: session } = useSession();
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [editParent, setEditParent] = useState<Parent | null>(null);
  const [deleteParentId, setDeleteParentId] = useState<string | null>(null);
  const [createParent, setCreateParent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [parentSearchQuery, setParentSearchQuery] = useState<string>("");
  const [parentFormData, setParentFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    childrenIds: [] as string[],
  });

  useEffect(() => {
    if (session?.accessToken) {
      fetchParents();
      fetchStudents();
    }
  }, [session]);

  const fetchParents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parents`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      setParents(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch parents");
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/students`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      setStudents(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch students");
    }
  };

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) {
      setFormError("Session not found");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parents`,
        parentFormData,
        { headers: { Authorization: `Bearer ${session.accessToken}` } }
      );
      setParents([...parents, response.data]);
      setCreateParent(false);
      setParentFormData({
        fullName: "",
        phoneNumber: "",
        address: "",
        childrenIds: [],
      });
      setFormError("");
      await fetchStudents();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to create parent");
    }
  };

  const handleEditParent = (parent: Parent) => {
    setEditParent(parent);
    setParentFormData({
      fullName: parent.fullName || "",
      phoneNumber: parent.phoneNumber || "",
      address: parent.address || "",
      childrenIds: parent.children?.map((child) => child.id) || [],
    });
  };

  const handleUpdateParent = async () => {
    setLoading(true);
    if (!editParent || !session?.accessToken) {
      setFormError("Session not found");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parents/${editParent.id}`,
        parentFormData,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      setParents(
        parents.map((p) => (p.id === editParent.id ? response.data : p))
      );
      setEditParent(null);
      setParentFormData({
        fullName: "",
        phoneNumber: "",
        address: "",
        childrenIds: [],
      });
      setFormError("");
      await fetchStudents();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to update parent");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParent = async () => {
    setLoading(true);
    if (!deleteParentId || !session?.accessToken) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/parents/${deleteParentId}`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      setParents(parents.filter((p) => p.id !== deleteParentId));
      setDeleteParentId(null);
      await fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete parent");
    } finally {
      setLoading(false);
    }
  };

  const handleParentInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "childrenIds") {
      if (e.target instanceof HTMLSelectElement) {
        const options = e.target.options;
        const selected: string[] = [];
        for (let i = 0; i < options.length; i++) {
          if (options[i].selected) {
            selected.push(options[i].value);
          }
        }
        setParentFormData((prev) => ({ ...prev, childrenIds: selected }));
      }
    } else {
      setParentFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const filteredParents = parents.filter((parent) =>
    [parent.fullName, parent.phoneNumber, parent.address]
      .filter((field): field is string => typeof field === "string")
      .some((field) =>
        field.toLowerCase().includes(parentSearchQuery.toLowerCase())
      )
  );

  if (loading) return <p className="text-center py-12">Loading...</p>;
  if (error) return <p className="text-red-500 text-center py-12">{error}</p>;

  return (
    <div className="py-6 px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Manage Parents</h2>
        <button
          onClick={() => setCreateParent(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Parent
        </button>
      </div>
      <div className="mb-6">
        <SearchBar
          searchQuery={parentSearchQuery}
          handleSearchChange={(e: any) => setParentSearchQuery(e.target.value)}
        />
      </div>
      {filteredParents.length === 0 ? (
        <p className="text-gray-600 mt-4">
          {parentSearchQuery
            ? "No parents match your search."
            : "No parents found."}
        </p>
      ) : (
        <div className="table-responsive mt-4">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Name
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Phone
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Address
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Children
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredParents.map((parent) => (
                <tr key={parent.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{parent.fullName}</td>
                  <td className="p-3">{parent.phoneNumber || "N/A"}</td>
                  <td className="p-3">{parent.address || "N/A"}</td>
                  <td className="p-3">
                    {parent.children?.map((child) => child.name).join(", ") ||
                      "N/A"}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleEditParent(parent)}
                      className="text-blue-600 hover:underline mr-2 hover:cursor-pointer"
                    >
                      Edit
                    </button>
                    {session?.user.role === "admin" && (
                      <button
                        onClick={() => setDeleteParentId(parent.id)}
                        className="text-red-600 hover:underline hover:cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Parent Modal */}
      <Modal
        isOpen={createParent || !!editParent}
        onClose={() => {
          setCreateParent(false);
          setEditParent(null);
          setFormError("");
          setParentFormData({
            fullName: "",
            phoneNumber: "",
            address: "",
            childrenIds: [],
          });
        }}
        title={editParent ? "Edit Parent" : "Add Parent"}
      >
        <form
          onSubmit={editParent ? handleUpdateParent : handleCreateParent}
          className="space-y-4"
        >
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
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
              className="mt-1 block w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
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
              className="mt-1 block w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
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
              className="mt-1 block w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="childrenIds"
              className="block text-sm font-medium text-gray-700"
            >
              Children
            </label>
            <select
              id="childrenIds"
              name="childrenIds"
              multiple
              value={parentFormData.childrenIds}
              onChange={handleParentInputChange}
              className="mt-1 block w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {students
                .filter((student) =>
                  student.parentIds.includes(editParent?.id!)
                )
                .map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.phoneNumber || "No phone number"})
                  </option>
                ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setCreateParent(false);
                setEditParent(null);
                setFormError("");
                setParentFormData({
                  fullName: "",
                  phoneNumber: "",
                  address: "",
                  childrenIds: [],
                });
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editParent ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Parent Modal */}
      <Modal
        isOpen={!!deleteParentId}
        onClose={() => setDeleteParentId(null)}
        title="Confirm Deletion"
      >
        <p className="mb-4 text-gray-600">
          Are you sure you want to delete this parent? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setDeleteParentId(null)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteParent}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:cursor-pointer"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
