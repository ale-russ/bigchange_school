"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { User } from "@/types/auth";
import SearchBar from "../ui/SearchBar";
import Modal from "../ui/Modal";
import UserForm from "./UserForm";

export default function TeacherManager() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "teacher" as "teacher" | "admin",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    if (session?.accessToken) {
      fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      //   const response = await axios.get("http://localhost:5000/api/users", {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/users`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
          params: { role: ["teacher", "admin"] },
        }
      );
      setUsers(response.data.filter((user: User) => user.role !== "student"));
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch users");
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role as "teacher" | "admin",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
    });
  };

  const handleUpdateUser = async (data: Partial<User>) => {
    // e.preventDefault();
    setLoading(true);
    if (!editUser || !session?.accessToken) {
      setFormError("Session not found");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        // `http://localhost:5000/api/users/${editUser.id}`,
        `${process.env.NEXT_PUBLIC_SERVER_URL}/users/${editUser.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      setUsers(users.map((u) => (u.id === editUser.id ? response.data : u)));
      setEditUser(null);
      setFormError("");
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to update user");
      await fetchUsers();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    if (!deleteUserId || !session?.accessToken) return;
    try {
      //   await axios.delete(`http://localhost:5000/api/users/${deleteUserId}`, {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/users/${deleteUserId}`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      setUsers(users.filter((u) => u.id !== deleteUserId));
      setDeleteUserId(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredUsers = users.filter((user) =>
    [user.name, user.email, user.role, user.phoneNumber, user.address]
      .filter((field): field is string => typeof field === "string")
      .some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <p className="text-center py-12">Loading...</p>;
  if (error) return <p className="text-red-500 text-center py-12">{error}</p>;

  return (
    <div className="py-6">
      <h2 className="text-2xl font-semibold mb-4 text-secondary">
        Manage Teachers
      </h2>
      <SearchBar
        searchQuery={searchQuery}
        handleSearchChange={(e: any) => setSearchQuery(e.target.value)}
      />
      {filteredUsers.length === 0 ? (
        <p className="text-secondary mt-4">No teachers or admins found.</p>
      ) : (
        <div className="table-responsive mt-4">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-secondary">
                  Name
                </th>
                <th className="p-3 text-left text-sm font-medium text-secondary">
                  Email
                </th>
                <th className="p-3 text-left text-sm font-medium text-secondary">
                  Role
                </th>
                <th className="p-3 text-left text-sm font-medium text-secondary">
                  Phone
                </th>
                <th className="p-3 text-left text-sm font-medium text-secondary">
                  Address
                </th>
                <th className="p-3 text-left text-sm font-medium text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3">{user.phoneNumber || "N/A"}</td>
                  <td className="p-3">{user.address || "N/A"}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-primary hover:underline mr-2 hover:cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteUserId(user.id)}
                      className="text-red-600 hover:underline hover:cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!editUser}
        onClose={() => {
          setEditUser(null);
          setFormError("");
        }}
        title="Edit User"
      >
        <UserForm
          user={editUser}
          onSubmit={handleUpdateUser}
          onCancel={() => setEditUser(null)}
          error={formError}
        />
      </Modal>

      <Modal
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        title="Confirm Deletion"
      >
        <p className="mb-4 text-secondary">
          Are you sure you want to delete this user? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setDeleteUserId(null)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteUser}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:cursor-pointer"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
