"use client";
import { useState } from "react";

const TestAnalytics = () => {
  const [selectedTest, setSelectedTest] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  // Sample data (will be fetched from API later)
  const tests = [
    {
      id: 1,
      title: "Physics Mid-Term",
      subject: "Physics",
      date: "2024-03-15",
    },
    {
      id: 2,
      title: "Chemistry Quiz",
      subject: "Chemistry",
      date: "2024-03-10",
    },
  ];

  const testData = {
    overview: {
      totalStudents: 120,
      attempted: 115,
      passed: 98,
      failed: 17,
      averageScore: 72.5,
      averageTime: 45, // minutes
      highestScore: 98,
      lowestScore: 35,
    },
    distribution: [
      { range: "90-100", count: 15 },
      { range: "80-89", count: 25 },
      { range: "70-79", count: 35 },
      { range: "60-69", count: 20 },
      { range: "Below 60", count: 20 },
    ],
    questionAnalysis: [
      {
        id: 1,
        question: "What is Newton's First Law?",
        correctResponses: 85,
        incorrectResponses: 30,
        avgTime: 2.5, // minutes
        difficulty: "medium",
      },
      // More questions...
    ],
    timeAnalysis: {
      "0-15": 10,
      "16-30": 25,
      "31-45": 45,
      "46-60": 35,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Test Analytics</h2>
          <div className="flex gap-4">
            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Select Test</option>
              {tests.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.title} ({test.date})
                </option>
              ))}
            </select>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="all">All Classes</option>
              <option value="10a">Class 10-A</option>
              <option value="10b">Class 10-B</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Total Students
          </h3>
          <p className="text-3xl font-bold text-gray-800">
            {testData.overview.totalStudents}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Attempted: {testData.overview.attempted}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pass/Fail</h3>
          <p className="text-3xl font-bold text-green-600">
            {testData.overview.passed}
          </p>
          <p className="text-sm text-red-500 mt-1">
            Failed: {testData.overview.failed}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Average Score
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {testData.overview.averageScore}%
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Range: {testData.overview.lowestScore}% -{" "}
            {testData.overview.highestScore}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Average Time
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {testData.overview.averageTime}m
          </p>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Score Distribution
        </h3>
        <div className="h-64">
          <div className="h-full flex items-end justify-between gap-4">
            {testData.distribution.map((range) => (
              <div
                key={range.range}
                className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{
                    height: `${
                      (range.count / testData.overview.attempted) * 100
                    }%`,
                    minHeight: "20px",
                  }}
                />
                <p className="text-sm font-medium mt-2">{range.range}</p>
                <p className="text-xs text-gray-500">{range.count} students</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Question Analysis
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Correct
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Incorrect
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Avg Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Difficulty
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {testData.questionAnalysis.map((question) => (
                <tr key={question.id}>
                  <td className="px-6 py-4">{question.question}</td>
                  <td className="px-6 py-4">
                    <span className="text-green-600 font-medium">
                      {question.correctResponses}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      (
                      {Math.round(
                        (question.correctResponses /
                          testData.overview.attempted) *
                          100
                      )}
                      %)
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-red-600 font-medium">
                      {question.incorrectResponses}
                    </span>
                  </td>
                  <td className="px-6 py-4">{question.avgTime}m</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        question.difficulty === "easy"
                          ? "bg-green-100 text-green-800"
                          : question.difficulty === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                      {question.difficulty.charAt(0).toUpperCase() +
                        question.difficulty.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Completion Time Analysis
        </h3>
        <div className="h-64">
          <div className="h-full flex items-end justify-between gap-4">
            {Object.entries(testData.timeAnalysis).map(([range, count]) => (
              <div key={range} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-purple-500 rounded-t"
                  style={{
                    height: `${(count / testData.overview.attempted) * 100}%`,
                    minHeight: "20px",
                  }}
                />
                <p className="text-sm font-medium mt-2">{range} mins</p>
                <p className="text-xs text-gray-500">{count} students</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAnalytics;
