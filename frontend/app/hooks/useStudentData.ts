import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

import { Student, Class, Parent } from "@/types/auth";

export default function useStudentData() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchStudents = async () => {
    if (!session?.accessToken) return;
    setLoading(false);

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/students`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      setStudents(response.data);
    } catch (err) {
      setError("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    if (!session?.accessToken) return;
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/classes`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      setClasses(response.data);
    } catch (err: any) {
      setError("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchParents = async () => {
    if (!session?.accessToken) return;
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parents`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      setParents(response.data);
    } catch (err: any) {
      setError("Failed to fetch parents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      Promise.all([fetchStudents(), fetchClasses(), fetchParents()]).catch(() =>
        setError("Failed to load data")
      );
    }
  }, [session]);

  return {
    students,
    classes,
    parents,
    loading,
    error,
    fetchStudents,
    fetchParents,
    setParents,
  };
}
