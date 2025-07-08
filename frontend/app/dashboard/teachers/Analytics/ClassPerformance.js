"use client";
import { useState } from "react";

const ClassPerformance = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [timeRange, setTimeRange] = useState("month");
  const [subject, setSubject] = useState("all");

  // Sample data (will be fetched from API later)
  const classData = {
    overview: {
      totalStudents: 35,
      averageAttendance: 92,
      averageScore: 76.5,
      testsCompleted: 15,
      upcomingTests: 3,
      subjectPerformance: [
        { subject: "Physics", average: 78.5, trend: "up" },
        { subject: "Chemistry", average: 75.2, trend: "down" },
        { subject: "Mathematics", average: 82.1, trend: "up" },
        { subject: "Biology", average: 79.8, trend: "stable" },
      ],
    },
    studentRankings: [
      {
        id: 1,
        name: "John Doe",
        rollNo: "101",
        averageScore: 92.5,
        attendance: 95,
        testsCompleted: 15,
        trend: "up",
      },
      // More students...
    ],
    monthlyProgress: [
      { month: "Jan", average: 72 },
      { month: "Feb", average: 75 },
      { month: "Mar", average: 78 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Class Performance
          </h2>
          <div className="flex gap-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Select Class</option>
              <option value="10a">Class 10-A</option>
              <option value="10b">Class 10-B</option>
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Total Students
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {classData.overview.totalStudents}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Average Attendance
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {classData.overview.averageAttendance}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Average Score
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {classData.overview.averageScore}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Tests Completed
          </h3>
          <p className="text-3xl font-bold text-orange-600">
            {classData.overview.testsCompleted}
          </p>
        </div>
      </div>

      {/* Subject Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Subject Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {classData.overview.subjectPerformance.map((subject, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-700">{subject.subject}</h4>
              <div className="flex items-center mt-2">
                <span className="text-2xl font-bold text-gray-800">
                  {subject.average}%
                </span>
                <span className="ml-2">
                  {subject.trend === "up" ? (
                    <span className="text-green-600">↑</span>
                  ) : subject.trend === "down" ? (
                    <span className="text-red-600">↓</span>
                  ) : (
                    <span className="text-gray-600">→</span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Monthly Progress
        </h3>
        <div className="h-64">
          <div className="h-full flex items-end justify-between gap-4">
            {classData.monthlyProgress.map((month) => (
              <div
                key={month.month}
                className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${month.average}%` }}
                />
                <p className="text-sm font-medium mt-2">{month.month}</p>
                <p className="text-xs text-gray-500">{month.average}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassPerformance;
