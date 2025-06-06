import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Class, User, Student } from "@/types/auth";

export default function useClassData() {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/classes`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      setClasses(response.data);
    } catch (err: any) {
      setError("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/users`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
          params: { role: "teacher" },
        }
      );
      setTeachers(response.data);
    } catch (err: any) {
      setError("Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/students`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
          params: { role: "student" },
        }
      );
      setStudents(response.data);
    } catch (err: any) {
      setError("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchClasses();
      fetchTeachers();
      fetchStudents();
    }
  }, [session]);

  return {
    classes,
    teachers,
    students,
    loading,
    error,
    fetchClasses,
    fetchTeachers,
    fetchStudents,
  };
}
