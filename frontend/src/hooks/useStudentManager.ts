import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Student, Class, Parent } from '@/lib/types';



const editSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
  parents: z.array(z.string()).min(1, 'At least one parent ID is required').max(2, 'Maximum 2 parents allowed'),
  level: z.string().optional(),
  address: z.string().min(3, 'Address must be at least 3 characters').optional(),
  classId: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

export function useStudentManager(searchQuery: string) {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem('token');

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: '', phoneNumber: '', parents: [], level: '', address: '', classId: '' },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [studentResponse, classResponse, parentsResponse] = await Promise.all([
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
        toast.error('Failed to fetch data');
        console.error('Fetch error:', error);
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
      phoneNumber: student.phoneNumber || '',
      parents: student.parentIds || [],
      level: student.level || '',
      address: student.address || '',
      classId: student.class?.id || '',
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
      console.log('Submitting data:', data); // Debug payload
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
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
      setEditOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to update ${selectedStudent.name}`);
      console.error('Update error:', err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedStudent) return;
    setIsLoading(true);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/students/${selectedStudent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Deleted ${selectedStudent.name}`);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
      setDeleteOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to delete ${selectedStudent.name}`);
      console.error('Delete error:', error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.class?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.parentIds || []).some((parentId) => parentId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return {
    students: filteredStudents,
    classes,
    parents,
    editOpen,
    deleteOpen,
    selectedStudent,
    isLoading,
    editForm,
    handleEdit,
    handleDelete,
    onEditSubmit,
    onDeleteConfirm,
    setEditOpen,
    setDeleteOpen,
  };
}