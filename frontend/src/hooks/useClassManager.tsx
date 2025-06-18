import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Class, Student } from "@/lib/types";
import { useStudentManager } from "./useStudentManager";

const classSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  level: z.string().min(1, "Level is required"),
  teacherId: z.string().optional(), // Made optional
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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null); //A-Z or Z-A
  const [filterType, setFilterType] = useState<
    "phoneNumber" | "address" | "level" | null
  >(null); // Filter types
  const [filterValue, setFilterValue] = useState<string>(""); //Filter value (e.g address or level)

  const { students, setStudents } = useStudentManager(searchQuery);

  const token = localStorage.getItem("token");

  const editForm = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      level: "",
      teacherId: "",
      studentIds: [],
    },
  });

  const createForm = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      level: "",
      teacherId: "",
      studentIds: [],
    },
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
      teacherId: classItem?.teacher ? classItem.teacher?.id : "",
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
      const payload = { ...data };
      if (!payload.teacherId) delete payload.teacherId; // Remove if empty
      await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/classes/${selectedClass.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Updated ${data.name}`);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/classes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClasses(response.data);
      setEditOpen(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || `Failed to update ${selectedClass.name}`
      );
      console.error("Update error:", err.response?.data);
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Deleted ${selectedClass.name}`);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/classes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClasses(response.data);
      setDeleteOpen(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to delete ${selectedClass.name}`
      );
      console.error("Delete error:", error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const onCreateSubmit = async (data: ClassFormValues) => {
    setIsLoading(true);
    try {
      const payload = { ...data };
      if (!payload.teacherId) delete payload.teacherId; // Remove if empty
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/classes`,
        payload,
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

  // Apply sorting and filtering to classes
  const processedClasses = useMemo(() => {
    let result = [...classes];

    // Apply sorting
    if (sortOrder) {
      result = result.map((classItem) => ({
        ...classItem,
        students: [...classItem.students].sort((a, b) =>
          sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        ),
      }));
    }

    // Apply filtering
    if (filterType && filterType) {
      result = result.map((classItem) => ({
        ...classItem,
        students: classItem.students.filter((student) => {
          switch (filterType) {
            case "phoneNumber":
              return !!student.phoneNumber; //filter by student phone number
            case "address":
              return (
                !!student.address
                  ?.toLowerCase()
                  .includes(filterValue.toLowerCase()) || false
              );
            case "level":
              return (
                student.level?.toLowerCase() === filterValue.toLowerCase() ||
                false
              );
            default:
              return true;
          }
        }),
      }));
    } else if (filterType === "phoneNumber") {
      result = result.map((classItem) => ({
        ...classItem,
        students: classItem.students.filter((student) => !!student.phoneNumber),
      }));
    }

    return result.filter(
      (classItem) =>
        classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.teacher.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        classItem.students.filter((student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [classes, sortOrder, filterType, filterValue, searchQuery]);

  return {
    classes: processedClasses,
    students,
    editOpen,
    deleteOpen,
    createOpen,
    selectedClass,
    isLoading,
    editForm,
    createForm,
    filterType,
    filterValue,
    handleEdit,
    handleDelete,
    onEditSubmit,
    onDeleteConfirm,
    onCreateSubmit,
    setEditOpen,
    setDeleteOpen,
    setCreateOpen,
    setSortOrder,
    setFilterType,
    setFilterValue,
  };
}
