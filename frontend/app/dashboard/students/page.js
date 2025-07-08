"use client";

import { useEffect, useState } from "react";
import api from "../../../api";
import { Line, Bar } from "react-chartjs-2";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const router = useRouter();
  const [counts, setCounts] = useState({
    active_tests: 0,
    pending_tests: 0,
    class_total_students: 0,
    student_rank: null,
  });
  const [subjectData, setSubjectData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
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
        const [countsRes, subjectRes, monthlyRes] = await Promise.all([
          api.get("/users/student/counts/"),
          api.get("/tests/analytics/student-subject/"),
          api.get("/tests/analytics/student-monthly/"),
        ]);

        setCounts(countsRes.data);
        setSubjectData(subjectRes.data);
        setMonthlyData(monthlyRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
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

  // Chart data and options for Subject Performance
  // Chart data and options for Subject Performance
  const subjectChartData = {
    labels: subjectData.map((item) => item.test__subject), // Adjusted to access the subject name
    datasets: [
      {
        label: "Average Score",
        data: subjectData.map((item) => item.average_score),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Total Attempts",
        data: subjectData.map((item) => item.total_attempts),
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Chart data and options for Monthly Analytics
  const monthlyChartData = {
    labels: monthlyData.map((item) =>
      new Date(item.month).toLocaleString("default", {
        month: "short",
        year: "numeric",
      })
    ),
    datasets: [
      {
        label: "Tests Attempted",
        data: monthlyData.map((item) => item.tests_attempted),
        fill: true,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Average Score",
        data: monthlyData.map((item) => item.average_score),
        fill: true,
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-blue-700">Active Tests</h3>
          <p className="text-3xl font-bold text-blue-900">
            {counts.active_tests}
          </p>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-yellow-700">
            Pending Tests
          </h3>
          <p className="text-3xl font-bold text-yellow-900">
            {counts.pending_tests}
          </p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-purple-700">Classmates</h3>
          <p className="text-3xl font-bold text-purple-900">
            {counts.class_total_students}
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-green-700">Your Rank</h3>
          <p className="text-3xl font-bold text-green-900">
            {counts.student_rank ?? "N/A"}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold text-blue-700">
            Performance by Subject
          </h3>
          <Bar data={subjectChartData} />
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold text-blue-700">
            Monthly Test Analytics
          </h3>
          <Line data={monthlyChartData} />
        </div>
      </div>
    </div>
  );
}
