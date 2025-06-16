import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Student, Class, Parent } from "@/lib/types";

const editSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .optional(),
  parents: z
    .array(z.string())
    .min(1, "At least one parent ID is required")
    .max(2, "Maximum 2 parents allowed"),
  level: z.string().optional(),
  address: z
    .string()
    .min(3, "Address must be at least 3 characters")
    .optional(),
  classId: z.string().optional(),
});

const parentSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address").optional(),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  address: z
    .string()
    .min(3, "Address must be at least 3 characters")
    .optional(),
});

type EditFormValues = z.infer<typeof editSchema>;
type ParentFormValues = z.infer<typeof parentSchema>;

export function useStudentManager(searchQuery: string) {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [createParentOpen, setCreateParentOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      phoneNumber: "",
      parents: [],
      level: "",
      address: "",
      classId: "",
    },
  });

  const createForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      phoneNumber: "",
      parents: [],
      level: "",
      address: "",
      classId: "",
    },
  });

  const createParentForm = useForm<ParentFormValues>({
    resolver: zodResolver(parentSchema),
    mode: "onSubmit",
    defaultValues: { fullName: "", email: "", phoneNumber: "", address: "" },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [studentResponse, classResponse, parentsResponse] =
          await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/students`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/classes`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/parents`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
        setStudents(studentResponse.data);
        setClasses(classResponse.data);
        setParents(parentsResponse.data);
      } catch (error) {
        toast.error("Failed to fetch data");
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    editForm.reset({
      name: student.name,
      phoneNumber: student.phoneNumber || "",
      parents: student.parentIds || [],
      level: student.level || "",
      address: student.address || "",
      classId: student.class?.id || "",
    });
    setEditOpen(true);
  };

  const handleDelete = (student: Student) => {
    setSelectedStudent(student);
    setDeleteOpen(true);
  };

  const onEditSubmit = async (data: EditFormValues) => {
    if (!selectedStudent) return;
    setIsLoading(true);
    try {
      console.log("Submitting data:", data); // Debug payload
      await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/students/${selectedStudent.id}`,
        {
          ...data,
          parentIds: data.parents, // Explicitly map to parentIds
          class: data.classId ? { id: data.classId } : null, // Match Student type
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Updated ${data.name}`);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudents(response.data);
      setEditOpen(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          `Failed to update ${selectedStudent.name}`
      );
      console.error("Update error:", err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedStudent) return;
    setIsLoading(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/students/${selectedStudent.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Deleted ${selectedStudent.name}`);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudents(response.data);
      setDeleteOpen(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to delete ${selectedStudent.name}`
      );
      console.error("Delete error:", error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.address || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (student.class?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (student.parentIds || []).some((parentId) =>
        parentId.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const onCreateSubmit = async (data: EditFormValues) => {
    console.log("create Student data: ", data);
    setIsLoading(true);

    try {
      let parentIds = data.parents;
      console.log("parentIds: ", parentIds.length);
      if (parentIds.length === 0) {
        // Create a new parent if none is selected
        const newParent = {
          fullName: `${data.name} Parent`,
          phoneNumber: "",
          address: "",
        };

        console.log("Parent: ", newParent);

        const parentResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/parents`,
          newParent,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        parentIds = [parentResponse.data.id];
        setParents((prev) => [...prev, parentResponse.data]);
      } else {
        const studentData = {
          ...data,
          parentIds,
          class: data?.classId ? { id: data.classId } : null,
        };

        console.log("submitting create data", studentData);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/students`,
          studentData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success(`Created ${data.name}`);
        setStudents((prev) => [...prev, response.data]);
        setCreateOpen(false);
        createForm.reset({
          name: "",
          phoneNumber: "",
          parents: [],
          level: "",
          address: "",
          classId: "",
        });
      }
    } catch (err: any) {
      console.log("Error: ", err);
      toast.error(err.response?.data?.message || "Failed to create student");
    } finally {
      setIsLoading(false);
    }
  };

  const onCreateParentSubmit = async (data: ParentFormValues) => {
    console.log("in create parent function");
    // setIsLoading(true);
    console.log("data: ", data);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parents`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newParent = response.data;
      setParents((prev) => [...prev, newParent]);
      createForm.setValue("parents", [newParent.id]); // Select the new parent
      setCreateParentOpen(false);
      setCreateOpen(true); // Reopen student creation modal
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create parent");
      console.error("Parent create error:", err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    students: filteredStudents,
    classes,
    parents,
    editOpen,
    deleteOpen,
    createOpen,
    createParentOpen,
    selectedStudent,
    isLoading,
    editForm,
    createForm,
    createParentForm,
    handleEdit,
    handleDelete,
    onEditSubmit,
    onDeleteConfirm,
    onCreateSubmit,
    onCreateParentSubmit,
    setEditOpen,
    setDeleteOpen,
    setCreateOpen,
    setCreateParentOpen,
  };
}
