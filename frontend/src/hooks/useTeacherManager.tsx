import React, { useState, useEffect } from "react";
import axios from "axios";
import { z } from "zod";
import { Class, User } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const editSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "teacher"]),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 3 characters"),
});

type EditFormValues = z.infer<typeof editSchema>;

export function useTeacherManager(searchQuery: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "teacher",
      phoneNumber: "",
      address: "",
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUsers(response.data);
      } catch (err) {
        toast.error("Failed to fetch students");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      editForm.reset({
        name: selectedTeacher.name,
        email: selectedTeacher.email,
        role: selectedTeacher.role as "admin" | "teacher",
        phoneNumber: selectedTeacher.phoneNumber,
        address: selectedTeacher.address,
      });
    }
  }, [selectedTeacher, editForm]);

  const handleEdit = (user: User) => {
    setSelectedTeacher({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
    });
    setEditOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedTeacher(user);
    setDeleteOpen(true);
  };

  const onEditSubmit = async (data: EditFormValues) => {
    if (!selectedTeacher) return;
    setIsLoading(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/users/${selectedTeacher.id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Updated ${data.name}`);
      setEditOpen(false);

      setUsers((prevUser) =>
        prevUser.map((user) =>
          user.id === selectedTeacher.id ? { ...user, ...data } : user
        )
      );
      // Refresh data (e.g., refetch from API)
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to update ${selectedTeacher.name}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedTeacher) return;
    setIsLoading(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/users/${selectedTeacher.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove deleted use from state
      setUsers((prevUser) =>
        prevUser.filter((user) => user.id !== selectedTeacher.id)
      );

      toast.success(`Deleted ${selectedTeacher.name}`);
      setDeleteOpen(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to delete ${selectedTeacher.name}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeachers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    users: filteredTeachers,
    editUser,
    editOpen,
    deleteOpen,
    selectedTeacher,
    isLoading,
    editForm,
    setUsers,
    setEditUser,
    setEditOpen,
    setDeleteOpen,
    setSelectedTeacher,
    setIsLoading,
    handleDelete,
    handleEdit,
    onEditSubmit,
    onDeleteConfirm,
  };
}
