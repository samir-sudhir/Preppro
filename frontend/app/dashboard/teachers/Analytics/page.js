"use client";

import React, { useEffect, useRef, useState } from "react";
import api from "../../../../api";
import { Bar, Doughnut, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { jsPDF } from "jspdf";
import { FaDownload } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const colorPalette = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
  "#22C55E",
  "#E11D48",
  "#7C3AED",
];

const getFixedColors = (count) => colorPalette.slice(0, count);

// 📥 Utility: Download Chart as Image or PDF
const ChartControls = ({ chartRef, title }) => {
  const downloadImage = (type) => {
    const chart = chartRef.current;
    if (!chart) return;

    const base64 = chart.toBase64Image();

    if (type === "png" || type === "svg") {
      const link = document.createElement("a");
      link.href = base64;
      link.download = `${title}.${type}`;
      link.click();
    }

    if (type === "pdf") {
      const canvas = chart.canvas;
      const pdf = new jsPDF();
      const width = canvas?.width || 300;
      const height = canvas?.height || 150;

      pdf.addImage(base64, "PNG", 10, 10, width / 3, height / 3);
      pdf.save(`${title}.pdf`);
    }
  };

  return (
    <div className="flex gap-2 justify-end mb-2 text-sm text-gray-600">
      <button
        onClick={() => downloadImage("png")}
        className="hover:underline flex items-center gap-1">
        <FaDownload /> PNG
      </button>
      <button
        onClick={() => downloadImage("pdf")}
        className="hover:underline flex items-center gap-1">
        <FaDownload /> PDF
      </button>
    </div>
  );
};

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const barRef1 = useRef(null);
  const barRef2 = useRef(null);
  const doughnutRef = useRef(null);
  const pieRef = useRef(null);

  const fetchAnalytics = async () => {
    try {
      const [res] = await Promise.all([
        api.get("/tests/analytics/teacher/"),
        new Promise((resolve) => setTimeout(resolve, 1000)), // artificial delay
      ]);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="pl" width="120" height="120" viewBox="0 0 240 240">
          <circle
            className="pl__ring pl__ring--a"
            cx="120"
            cy="120"
            r="105"
            fill="none"
            stroke="#000"
            strokeWidth="20"
            strokeDasharray="0 660"
            strokeDashoffset="-330"
            strokeLinecap="round"
          />
          <circle
            className="pl__ring pl__ring--b"
            cx="120"
            cy="120"
            r="35"
            fill="none"
            stroke="#000"
            strokeWidth="20"
            strokeDasharray="0 220"
            strokeDashoffset="-110"
            strokeLinecap="round"
          />
          <circle
            className="pl__ring pl__ring--c"
            cx="85"
            cy="120"
            r="70"
            fill="none"
            stroke="#000"
            strokeWidth="20"
            strokeDasharray="0 440"
            strokeLinecap="round"
          />
          <circle
            className="pl__ring pl__ring--d"
            cx="155"
            cy="120"
            r="70"
            fill="none"
            stroke="#000"
            strokeWidth="20"
            strokeDasharray="0 440"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  if (!data)
    return <p className="p-4 text-red-600">Failed to load analytics.</p>;

  const { tests_created, test_performance, top_students, hardest_questions } =
    data;

  const testPerformanceData = {
    labels: test_performance.map((t) => t.test__title),
    datasets: [
      {
        label: "Average Score",
        data: test_performance.map((t) => t.avg_score),
        backgroundColor: getFixedColors(test_performance.length),
      },
    ],
  };

  const topStudentData = {
    labels: top_students.map((s) => s.student_name),
    datasets: [
      {
        label: "Total Score",
        data: top_students.map((s) => s.total_score),
        backgroundColor: getFixedColors(top_students.length),
      },
    ],
  };

  const hardestQuestionData = {
    labels: hardest_questions.map((q) => q.question__question),
    datasets: [
      {
        label: "Correct Attempts",
        data: hardest_questions.map((q) => q.correct_attempts),
        backgroundColor: getFixedColors(hardest_questions.length),
      },
    ],
  };

  const testDifficultyCounts = tests_created.reduce((acc, test) => {
    const diff = test.difficulty || "unknown";
    acc[diff] = (acc[diff] || 0) + 1;
    return acc;
  }, {});

  const difficultyData = {
    labels: Object.keys(testDifficultyCounts),
    datasets: [
      {
        data: Object.values(testDifficultyCounts),
        backgroundColor: getFixedColors(
          Object.keys(testDifficultyCounts).length
        ),
      },
    ],
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Test Performance Chart */}
      <div className="bg-white p-6 shadow rounded-2xl">
        <h2 className="text-xl font-semibold mb-4 text-blue-700">
          Test Performance (Average Scores)
        </h2>
        <ChartControls chartRef={barRef1} title="test_performance" />
        <div className="h-[400px]">
          <Bar
            ref={barRef1}
            data={testPerformanceData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false, // Hide legend
                },
              },
            }}
          />
        </div>
      </div>

      {/* Hardest Questions Chart */}
      <div className="bg-white p-6 shadow rounded-2xl">
        <h2 className="text-xl font-semibold mb-4 text-blue-700">
          Hardest Questions (Low Correct Attempts)
        </h2>
        <ChartControls chartRef={barRef2} title="hardest_questions" />
        <div className="h-[400px]">
          <Bar
            ref={barRef2}
            data={hardestQuestionData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false, // Hide legend
                },
              },
            }}
          />
        </div>
      </div>

      {/* Pie Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 shadow rounded-2xl">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">
            Top Students
          </h2>
          <ChartControls chartRef={doughnutRef} title="top_students" />
          <div className="h-[350px]">
            <Doughnut
              ref={doughnutRef}
              data={topStudentData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="bg-white p-6 shadow rounded-2xl">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">
            Test Difficulty Distribution
          </h2>
          <ChartControls chartRef={pieRef} title="test_difficulty" />
          <div className="h-[350px]">
            <Pie
              ref={pieRef}
              data={difficultyData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
