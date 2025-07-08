"use client";

import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import api from "../../../api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default function Dashboard() {
  const router = useRouter();
  const [subjectData, setSubjectData] = useState({ labels: [], values: [] });
  const [monthData, setMonthData] = useState({ labels: [], values: [] });
  const [stats, setStats] = useState({
    totalQuestions: 0,
    activeTests: 0,
    studentCount: 0,
    teacherCount: 0,
  });
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        // Check if user has a profile
        await api.get("/users/profile/");
        return true;
      } catch (error) {
        if (error.response?.status === 404) {
          setShowProfileDialog(true);
          return false;
        }
        throw error;
      }
    };

    const fetchData = async () => {
      try {
        // Fetching analytics data
        const [subjectRes, monthRes, statsRes] = await Promise.all([
          api.get("/tests/analytics/subject-count/"),
          api.get("/tests/analytics/monthly-count/"),
          api.get("/users/teacher/counts/"),
        ]);

        setSubjectData({
          labels: subjectRes.data.map((item) => item.subject),
          values: subjectRes.data.map((item) => item.count),
        });

        setMonthData({
          labels: monthRes.data.map((item) => item.month),
          values: monthRes.data.map((item) => item.count),
        });

        setStats({
          totalQuestions: statsRes.data.total_questions,
          activeTests: statsRes.data.active_tests,
          studentCount: statsRes.data.student_count,
          teacherCount: statsRes.data.teacher_count,
        });
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        toast.error("Failed to load dashboard data");
      }
    };

    // First check profile, then fetch data if profile exists
    checkProfile().then((hasProfile) => {
      if (hasProfile) {
        fetchData();
      }
    });
  }, [router]);

  const handleProfileSetup = () => {
    setShowProfileDialog(false);
    router.push("/signup/setup-profile");
  };

  const handleCancel = () => {
    setShowProfileDialog(false);
    router.push("/login");
  };

  // Profile Setup Dialog
  const ProfileSetupDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Complete Your Profile
        </h2>
        <p className="text-gray-600 mb-6">
          To access the dashboard, you need to complete your profile setup
          first. Would you like to set up your profile now?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
            Cancel
          </button>
          <button
            onClick={handleProfileSetup}
            className="px-4 py-2 bg-[#8b5dff] text-white rounded-lg hover:bg-[#7a4bc4]">
            Set Up Profile
          </button>
        </div>
      </div>
    </div>
  );

  if (showProfileDialog) {
    return <ProfileSetupDialog />;
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-700">
            Total Questions
          </h3>
          <p className="text-3xl font-bold text-blue-900">
            {stats.totalQuestions}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-green-700">Active Tests</h3>
          <p className="text-3xl font-bold text-green-900">
            {stats.activeTests}
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-700">Students</h3>
          <p className="text-3xl font-bold text-purple-900">
            {stats.studentCount}
          </p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-700">Teachers</h3>
          <p className="text-3xl font-bold text-yellow-900">
            {stats.teacherCount}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4 text-blue-700">
            Tests by Subject
          </h2>
          <div className="h-[300px]">
            <Bar
              data={{
                labels: subjectData.labels,
                datasets: [
                  {
                    label: "Tests",
                    data: subjectData.values,
                    backgroundColor: ["#ED8DC5", "#DC7AD6", "#8254E3"],
                    borderRadius: 10,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4 text-blue-700">
            Monthly Test Creation
          </h2>
          <div className="h-[300px]">
            <Line
              data={{
                labels: monthData.labels,
                datasets: [
                  {
                    label: "Tests",
                    data: monthData.values,
                    fill: true,
                    backgroundColor: "rgba(237, 141, 197, 0.2)",
                    borderColor: "#ED8DC5",
                    tension: 0.4,
                    pointBackgroundColor: "#8254E3",
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: "#555",
                    },
                  },
                },
                scales: {
                  x: {
                    ticks: { color: "#666" },
                  },
                  y: {
                    ticks: { color: "#666" },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
