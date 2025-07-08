"use client";
import { useState } from "react";

const StudentPerformance = () => {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [dateRange, setDateRange] = useState("month"); // week, month, year, custom
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  // Sample data (will be fetched from API later)
  const students = [
    { id: 1, name: "John Doe", class: "10-A", rollNo: "101" },
    { id: 2, name: "Jane Smith", class: "10-A", rollNo: "102" },
  ];

  const performanceData = {
    testsTaken: 15,
    averageScore: 78,
    highestScore: 95,
    lowestScore: 62,
    testsCompleted: 12,
    testsPending: 3,
    subjectPerformance: [
      { subject: "Physics", average: 82, tests: 5 },
      { subject: "Chemistry", average: 75, tests: 5 },
      { subject: "Mathematics", average: 79, tests: 5 },
    ],
    recentTests: [
      {
        id: 1,
        title: "Physics Mid-Term",
        date: "2024-03-15",
        score: 85,
        total: 100,
        status: "completed",
      },
      // More test results...
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Student Performance
          </h2>
          <div className="flex gap-4">
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.class}
                </option>
              ))}
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {dateRange === "custom" && (
          <div className="flex gap-4 mb-6">
            <input
              type="date"
              value={customRange.start}
              onChange={(e) =>
                setCustomRange({ ...customRange, start: e.target.value })
              }
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={customRange.end}
              onChange={(e) =>
                setCustomRange({ ...customRange, end: e.target.value })
              }
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Tests Taken
          </h3>
          <p className="text-3xl font-bold text-gray-800">
            {performanceData.testsTaken}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Average Score
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {performanceData.averageScore}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Highest Score
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {performanceData.highestScore}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Lowest Score
          </h3>
          <p className="text-3xl font-bold text-red-600">
            {performanceData.lowestScore}%
          </p>
        </div>
      </div>

      {/* Subject Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Subject Performance
        </h3>
        <div className="space-y-4">
          {performanceData.subjectPerformance.map((subject) => (
            <div key={subject.subject} className="flex items-center">
              <div className="w-32 font-medium">{subject.subject}</div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${subject.average}%` }}
                  />
                </div>
              </div>
              <div className="w-32 text-right">
                <span className="font-medium">{subject.average}%</span>
                <span className="text-gray-500 text-sm ml-2">
                  ({subject.tests} tests)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Tests */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Tests</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Test
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {performanceData.recentTests.map((test) => (
                <tr key={test.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{test.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{test.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">{test.score}</span>
                    <span className="text-gray-500">/{test.total}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        test.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {test.status.charAt(0).toUpperCase() +
                        test.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;
