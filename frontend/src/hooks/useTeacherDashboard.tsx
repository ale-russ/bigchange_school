import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Class, Student, TeacherDashboardData } from "@/lib/types";
import { toast } from "sonner";

export function useTeacherDashboard(teacherId: string) {
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData>({
    classes: [],
    totalClasses: 0,
    studentsByClass: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const studentResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/teacher/students`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("students: ", studentResponse);

        const { classes, students } = studentResponse.data;

        const classesResponses = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/classes`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const allClasses = classesResponses.data;

        // Filter classes by teacherId
        // const teacherClasses = allClasses.filter(
        //   (cls: Class) => cls.teacherId === teacherId
        // );
        const teacherClasses = classes;

        console.log("teacherClasses: ", teacherClasses);

        // Fetch all students and match with class studentIds
        const studentsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/students`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const allStudents = studentsResponse.data;

        const studentsByClass: { [classId: string]: Student[] } = {};
        teacherClasses.forEach((cls: Class) => {
          studentsByClass[cls.id] = allStudents.filter((student: Student) =>
            cls.studentIds?.includes(student.id)
          );
        });

        setDashboardData({
          classes: teacherClasses,
          totalClasses: teacherClasses.length,
          studentsByClass,
        });
      } catch (err) {
        toast.error("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [teacherId]);

  const processedData = useMemo(() => dashboardData, [dashboardData]);

  return { dashboardData: processedData, isLoading };
}
