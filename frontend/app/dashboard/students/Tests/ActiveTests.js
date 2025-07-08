"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import QuizAttempt from "./QuizAttempt";
import api from "../../../../api";

export default function ActiveTests() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignedTests = async () => {
      try {
        const response = await api.get("/tests/assigned/");
        const assignedTests = response.data;

        const formattedTests = assignedTests.map((item, index) => {
          const test = item.test || {};
          const assignedId = item.id ?? `assigned-${index}`;
          return {
            key: `${test.id ?? `test-${index}`}-${assignedId}`,
            id: test.id,
            title: test.title,
            duration: test.duration,
            questions: item.questions?.length || 0,
            attempted: item.attempted,
            is_submitted: item.is_submitted,
            allow_multiple_attempts: item.allow_multiple_attempts,
            fullData: item,
          };
        });

        setTests(formattedTests);
      } catch (error) {
        console.error("Error fetching assigned tests:", error);
        toast.error("Failed to load tests.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedTests();
  }, []);

  const handleStartQuiz = (test) => {
    if (test.is_submitted && !test.allow_multiple_attempts) {
      toast.info("Test already attempted. You cannot take it again.");
      return;
    }
    setSelectedTest(test.fullData);
    setShowQuiz(true);
  };

  const handleCompleteQuiz = () => {
    setShowQuiz(false);
  };

  return (
    <div className="space-y-6">
      {/* <h1 className="text-2xl font-bold mb-6">Assigned Tests</h1> */}

      {loading ? (
        <p>Loading tests...</p>
      ) : tests.length === 0 ? (
        <p>No active tests assigned.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tests.map((test) => (
            <div
              key={test.key}
              className="bg-white-900 p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300">
              <h2 className="text-xl font-semibold text-indigo-700 mb-3">
                {test.title}
              </h2>
              <div className="text-gray-600 space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Duration:</span>{" "}
                  {test.duration ?? "N/A"} minutes
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Questions:</span>{" "}
                  {test.questions}
                </p>
                {test.attempted && (
                  <p className="text-green-600 text-sm">Already attempted</p>
                )}
                {test.is_submitted && (
                  <p className="text-red-600 text-sm">Test submitted</p>
                )}
                {!test.allow_multiple_attempts && test.attempted && (
                  <p className="text-gray-500 text-sm italic">
                    One attempt only.
                  </p>
                )}
              </div>
              <button
                onClick={() => handleStartQuiz(test)}
                className={`inline-block px-5 py-2 rounded-full text-sm font-semibold transition duration-200
          ${
            test.attempted && !test.allow_multiple_attempts
              ? "bg-indigo-300 text-indigo-700 cursor-not-allowed"
              : "bg-indigo-400 text-white hover:bg-indigo-500"
          }`}
                disabled={test.attempted && !test.allow_multiple_attempts}>
                {test.attempted ? "Re-Attempt Quiz" : "Start Quiz"}
              </button>
            </div>
          ))}
        </div>
      )}

      {showQuiz && (
        <QuizAttempt test={selectedTest} onComplete={handleCompleteQuiz} />
      )}
    </div>
  );
}
