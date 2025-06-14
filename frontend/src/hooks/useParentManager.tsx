import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Parent } from "@/lib/types";

const parentSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  address: z
    .string()
    .min(3, "Address must be at least 3 characters")
    .optional(),
  children: z
    .array(z.string())
    .min(1, "At least one child is required")
    .optional(),
});

type ParentFormValues = z.infer<typeof parentSchema>;

export function useParentManager(searchQuery: string) {
  const [parents, setParents] = useState<Parent[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");

  const editForm = useForm<ParentFormValues>({
    resolver: zodResolver(parentSchema),
    mode: "onSubmit",
    defaultValues: { fullName: "", phoneNumber: "", address: "", children: [] },
  });

  const createForm = useForm<ParentFormValues>({
    resolver: zodResolver(parentSchema),
    mode: "onSubmit",
    defaultValues: { fullName: "", phoneNumber: "", address: "", children: [] },
  });

  useEffect(() => {
    const fetchParents = async () => {
      setIsLoading(true);

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/parents`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setParents(response.data);
        console.log("parents; ", parents);
      } catch (err: any) {
        toast.error("Failed to fetch: ", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParents();
  }, []);

  const handleEdit = (parent: Parent) => {
    setSelectedParent(parent);
    editForm.reset({
      fullName: parent.fullName,
      phoneNumber: parent.phoneNumber,
      address: parent.address,
      children: parent.children ? parent.children.map((child) => child.id) : [],
    });
    setEditOpen(true);
  };

  const handleDelete = (parent: Parent) => {
    setSelectedParent(parent);
    setDeleteOpen(true);
  };

  const onEditSubmit = async (data: ParentFormValues) => {
    if (!selectedParent) return;
    setIsLoading(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parents/${selectedParent.id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Updated ${data.fullName}`);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parents`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setParents(response.data);
      setEditOpen(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          `Failed to update ${selectedParent.fullName}`
      );
      console.error("Update error:", err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedParent) return;
    setIsLoading(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parents/${selectedParent.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Deleted ${selectedParent.fullName}`);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parents`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setParents(response.data);
      setDeleteOpen(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to delete ${selectedParent.fullName}`
      );
      console.error("Delete error:", error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const onCreateSubmit = async (data: ParentFormValues) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parents`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Created ${data.fullName}`);
      setParents((prev) => [...prev, response.data]);
      setCreateOpen(false);
      createForm.reset({
        fullName: "",
        phoneNumber: "",
        address: "",
        children: [],
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create parent");
      console.error("Create error:", err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredParents = parents.filter(
    (parent) =>
      parent.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (parent.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (parent.phoneNumber || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (parent.address || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      parent.children?.map((child) =>
        (child.name || "").toLowerCase().includes(searchQuery)
      )
  );

  return {
    parents: filteredParents,
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
  };
}
