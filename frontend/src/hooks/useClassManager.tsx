import React, { useState, useEffect } from "react";
import axios from "axios";
import { z } from "zod";
import { Class } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const classSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  level: z.string().min(1, "Level is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  studentIds: z.array(z.string()).optional(),
});

type ClassFormValues = z.infer<typeof classSchema>;

export function useClassManager(searchQuery: string) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");

  const editForm = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    mode: "onSubmit",
    defaultValues: { name: "", level: "", teacherId: "", studentIds: [] },
  });

  const createForm = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    mode: "onSubmit",
    defaultValues: { name: "", level: "", teacherId: "", studentIds: [] },
  });

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/classes`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setClasses(response.data);
      } catch (err: any) {
        toast.error("Failed to fetch classes: ", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleEdit = (classItem: Class) => {
    setSelectedClass(classItem);
    editForm.reset({
      name: classItem.name,
      level: classItem.level,
      teacherId: classItem.teacher.id,
      studentIds: classItem.students.map((student) => student.id),
    });
    setEditOpen(true);
  };

  const handleDelete = (classItem: Class) => {
    setSelectedClass(classItem);
    setDeleteOpen(true);
  };

  const onEditSubmit = async (data: ClassFormValues) => {
    if (!selectedClass) return;
    setIsLoading(true);

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/classes/${selectedClass.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`Updated ${data.name}`);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SEVER_URL}/classes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setClasses(response.data);
      setEditOpen(false);
    } catch (err: any) {
      toast.error(
        err.response.data?.message || `Failed to update ${selectedClass.name}`
      );
      console.log("Update Error: ", err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedClass) return;
    setIsLoading(true);

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/classes/${selectedClass.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`Deleted ${selectedClass.name}`);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/classes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClasses(response.data);
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || `Failed to delete ${selectedClass.name}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onCreateSubmit = async (data: ClassFormValues) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/classes`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Created ${data.name}`);
      setClasses((prev) => [...prev, response.data]);
      setCreateOpen(false);
      createForm.reset({ name: "", level: "", teacherId: "", studentIds: [] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create class");
      console.error("Create error:", err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.teacher.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      classItem.students.map((student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return {
    classes: filteredClasses,
    editOpen,
    deleteOpen,
    createOpen,
    selectedClass,
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
