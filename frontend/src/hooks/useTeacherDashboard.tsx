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

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const dataResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/teacher/students`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { teacher } = dataResponse.data;
        // console.log("dataResponse: ", teacher);

        const studentsByClass: { [classId: string]: Student[] } = {};

        teacher.classes.forEach((cls: Class) => {
          studentsByClass[cls.id] = cls.students;
        });

        setDashboardData({
          classes: teacher.classes,
          totalClasses: teacher.classes.length,
          studentsByClass,
        });
      } catch (err) {
        console.log("Error: ", err);
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
