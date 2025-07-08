import { useState, useEffect } from "react";
import api from "../../../../api";

const TestHistory = () => {
  const [testHistory, setTestHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const [selectedTest, setSelectedTest] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState(null);

  useEffect(() => {
    const fetchAssignedTests = async () => {
      try {
        const res = await api.get("/tests/assigned/");
        const formatted = res.data
          .filter((t) => t.attempted && t.latest_attempt)
          .map((item) => {
            const test = item.test;
            const attempt = item.latest_attempt;

            return {
              ...item, // includes questions_attempted, etc.
              id: test.id,
              title: test.title,
              subject: test.subject,
              completedDate: attempt.attempted_at,
              duration: test.duration,
              totalQuestions: attempt.total_questions,
              score: Math.round((attempt.score / test.total_marks) * 100),
              correctAnswers: attempt.correct_answers,
              teacher: test.created_by,
              timeSpent: Math.round(attempt.response_times / 60),
              multipleAttempt: test.multiple_attempt,
              isPublished: test.is_published,
            };
          });

        setTestHistory(formatted);
      } catch (err) {
        console.error("Failed to fetch assigned tests:", err);
      }
    };

    fetchAssignedTests();
  }, []);

  const filterByTime = (date) => {
    if (selectedTimeRange === "all") return true;
    const now = new Date();
    const completed = new Date(date);
    const diffDays = (now - completed) / (1000 * 60 * 60 * 24);
    if (selectedTimeRange === "week") return diffDays <= 7;
    if (selectedTimeRange === "month") return diffDays <= 30;
    if (selectedTimeRange === "3months") return diffDays <= 90;
    if (selectedTimeRange === "6months") return diffDays <= 180;
    if (selectedTimeRange === "year") return diffDays <= 365;
    return true;
  };

  const filteredTests = testHistory.filter((test) => {
    const matchesSearch = test.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSubject =
      selectedSubject === "all" || test.subject === selectedSubject;
    const matchesTime = filterByTime(test.completedDate);
    return matchesSearch && matchesSubject && matchesTime;
  });

  const handleReviewAnswers = async (test) => {
    setSelectedTest(test);
    setShowReviewModal(true);

    try {
      const res = await api.get(`/tests/${test.id}/attempt-preview/`);
      setReviewData(res.data); // Set the review data from the API response
    } catch (err) {
      console.error("Failed to fetch review data:", err);
    }
  };

  const closeModal = () => {
    setShowReviewModal(false);
    setSelectedTest(null);
    setReviewData(null); // Clear review data when closing the modal
  };

  return (
    <div className=" min-h-screen py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
        Test History
      </h2> */}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">All Subjects</option>
            {[...new Set(testHistory.map((t) => t.subject))].map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Test Cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredTests.map((test) => (
          <div
            key={test.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {test.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {test.subject} • {test.teacher} •{" "}
                    {new Date(test.completedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold text-indigo-600`}>
                    {test.score}%
                  </div>
                  <p className="text-sm text-gray-600">
                    {test.correctAnswers} of {test.totalQuestions} correct
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{test.duration} mins</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time Spent</p>
                  <p className="font-medium">{test.timeSpent} mins</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Questions</p>
                  <p className="font-medium">{test.totalQuestions}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Accuracy</p>
                  <p className="font-medium">
                    {Math.round(
                      (test.correctAnswers / test.totalQuestions) * 100
                    )}
                    %
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                {!test.multipleAttempt && test.isPublished && (
                  <button
                    onClick={() => handleReviewAnswers(test)}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    Review Answers
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {showReviewModal && reviewData && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center overflow-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                Review: {reviewData.test_title}
              </h3>
              <button onClick={closeModal} className="text-gray-500 text-2xl">
                &times;
              </button>
            </div>
            {reviewData.questions.map((question, index) => (
              <div key={index} className="border-b border-gray-200 py-4">
                <div className="font-semibold text-lg text-gray-700 mb-2">
                  {question.question_text}
                </div>
                <div className="mt-2 space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = optionIndex === question.selected_option;
                    const isCorrect = optionIndex === question.correct_option;
                    const bgColor = isCorrect
                      ? "bg-green-100" // Correct option
                      : !isCorrect && isSelected
                      ? "bg-red-100" // Selected wrong option
                      : "bg-gray-100"; // Default

                    const textColor = isCorrect
                      ? "text-green-800"
                      : !isCorrect && isSelected
                      ? "text-red-800"
                      : "text-gray-700";
                    return (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-md ${bgColor} ${textColor} flex items-center`}>
                        <span className="mr-2">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        <span>{option}</span>
                        {isSelected && !isCorrect && (
                          <span className="ml-2 text-xs text-red-600 italic">
                            (Your Answer)
                          </span>
                        )}
                        {isCorrect && !isSelected && (
                          <span className="ml-2 text-xs text-green-600 italic">
                            (Correct Answer)
                          </span>
                        )}
                        {isCorrect && isSelected && (
                          <span className="ml-2 text-xs text-green-600 italic">
                            (Correct Answer)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <span className="font-medium">Time Taken:</span>{" "}
                  {question.time_taken} seconds
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestHistory;
