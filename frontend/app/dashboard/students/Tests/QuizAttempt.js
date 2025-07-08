"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import api from "../../../../api";

export default function QuizAttempt({ test, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isAnswered, setIsAnswered] = useState({});
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [testResult, setTestResult] = useState(null); // Only set this after submission
  const [timeLeft, setTimeLeft] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [feedbackRequestText, setFeedbackRequestText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Track time spent per question
  const questionStartTimeRef = useRef(Date.now());
  const [responseTimes, setResponseTimes] = useState({});

  useEffect(() => {
    setMounted(true);
    if (test?.test?.duration) {
      setTimeLeft(test.test.duration * 60); // Set initial timer
    }
  }, [test]);

  const questions = test?.questions || [];

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await api.get(`/tests/${test.test.id}/attempts`);
        setAttempts(response.data);
      } catch (error) {
        console.error("Error fetching attempts:", error);
      }
    };
    fetchAttempts();
  }, [test.test.id]);

  // Update response time when question changes
  useEffect(() => {
    if (questions.length === 0) return;

    // When currentQuestion changes, calculate time spent on previous question
    if (currentQuestion > 0) {
      const prevQuestionIndex = currentQuestion - 1;
      const prevQuestionId = questions[prevQuestionIndex]?.question;
      if (prevQuestionId !== undefined) {
        const now = Date.now();
        const timeSpentSeconds = Math.floor(
          (now - questionStartTimeRef.current) / 1000
        );
        setResponseTimes((prev) => ({
          ...prev,
          [prevQuestionId]: (prev[prevQuestionId] || 0) + timeSpentSeconds,
        }));
        questionStartTimeRef.current = now;
      }
    } else {
      // For the first question, reset start time
      questionStartTimeRef.current = Date.now();
    }
  }, [currentQuestion, questions]);

  // Also update time spent on current question when submitting or timer ends
  const updateCurrentQuestionTime = () => {
    if (questions.length === 0) return;
    const currentQuestionId = questions[currentQuestion]?.question;
    if (currentQuestionId !== undefined) {
      const now = Date.now();
      const timeSpentSeconds = Math.floor(
        (now - questionStartTimeRef.current) / 1000
      );
      setResponseTimes((prev) => ({
        ...prev,
        [currentQuestionId]: (prev[currentQuestionId] || 0) + timeSpentSeconds,
      }));
      questionStartTimeRef.current = now;
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);

    // Update time for current question before submitting
    updateCurrentQuestionTime();

    const answers = {};
    for (const [qIndex, optionIndex] of Object.entries(selectedOptions)) {
      const questionId = questions[qIndex]?.question;
      if (questionId !== undefined) {
        answers[questionId] = optionIndex;
      }
    }

    if (Object.keys(answers).length === 0) {
      // Prevent submission if no answers are selected
      toast.error("You must answer at least one question before submitting.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/tests/attempt/", {
        test_id: test?.test?.id,
        answers,
        response_times: responseTimes,
      });

      // Set the result only after the test is successfully submitted
      setTestResult(response.data);
      toast.success("Test submitted successfully!");
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to submit test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && Object.keys(selectedOptions).length > 0) {
      // Only submit if the timer runs out and the user has selected at least one answer
      handleSubmit();
    }
  }, [timeLeft, selectedOptions]);

  const handleSubmitFeedback = async () => {
    if (!feedbackRequestText.trim()) {
      toast.error("Please enter your feedback request");
      return;
    }

    setSubmittingFeedback(true);
    try {
      const response = await api.post("/tests/feedback/", {
        attempt: testResult.id,
        feedback_text: feedbackRequestText,
      });

      if (response.data) {
        toast.success("Feedback request submitted successfully");
        setFeedbackRequestText("");
        handleCloseFeedback();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to submit feedback request";
      toast.error(errorMessage);
      console.error("Feedback request error:", error);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (!mounted) return null;

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleOptionSelect = (index) => {
    setSelectedOptions((prev) => ({ ...prev, [currentQuestion]: index }));
    setIsAnswered((prev) => ({ ...prev, [currentQuestion]: true }));
  };

  const handleNextQuestion = () => {
    if (!isAnswered[currentQuestion]) {
      toast.error(
        "Please select an answer before moving to the next question."
      );
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Only submit when all questions are answered and timer ends
      handleSubmit();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleFlagQuestion = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQuestion]: !prev[currentQuestion],
    }));
  };

  const getPerformanceFeedback = (score, totalQuestions) => {
    const percentage = (score / totalQuestions) * 100;
    let feedbackText = "";
    let emoji = "";

    if (percentage >= 90) {
      feedbackText = "Excellent job!";
      emoji = "🎉";
    } else if (percentage >= 75) {
      feedbackText = "Great work!";
      emoji = "👍";
    } else if (percentage >= 50) {
      feedbackText = "Good effort!";
      emoji = "🙂";
    } else {
      feedbackText = "Better luck next time!";
      emoji = "😞";
    }

    return { feedbackText, emoji, percentage };
  };

  const handleCloseFeedback = () => {
    onComplete(); // Close the modal and return to ActiveTests
  };

  // Show feedback only after submission and result calculation
  if (testResult) {
    const { score, total_questions, passed } = testResult;
    const { feedbackText, emoji, percentage } = getPerformanceFeedback(
      score,
      total_questions
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
          <button
            onClick={handleCloseFeedback}
            className="absolute top-4 right-4 text-gray-500 hover:text-black">
            <span className="text-2xl">×</span>
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center">Test Results</h2>
          <p className="text-lg mb-4 text-center">
            {feedbackText} {emoji}
          </p>
          <p className="text-lg text-center">
            Your Score: {score} / {total_questions}
          </p>
          <p className="text-lg text-center">
            Percentage: {percentage.toFixed(2)}%
          </p>
          <p className="text-lg text-center mb-6">
            {passed ? "You Passed!" : "You Did Not Pass."}
          </p>

          {/* Add Feedback Request Section */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-xl font-bold mb-4">Request Feedback</h3>
            <p className="text-gray-600 mb-4">
              Would you like specific feedback on this test? Let us know what
              aspects you'd like to improve.
            </p>
            <textarea
              value={feedbackRequestText}
              onChange={(e) => setFeedbackRequestText(e.target.value)}
              className="w-full h-32 p-2 border rounded-lg mb-4"
              placeholder="What specific feedback would you like about add?"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseFeedback}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Close
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
                {submittingFeedback
                  ? "Submitting..."
                  : "Submit Feedback Request"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Attempt quiz UI
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-xl shadow-2xl border-4 border-transparent animate-border-glow overflow-y-auto p-6">
        <div className="absolute top-4 right-6">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-4 py-2 rounded-full shadow-lg">
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4 text-center">
          Question {currentQuestion + 1} of {questions.length}
        </h2>

        <p className="text-lg text-gray-800 mb-6">
          {questions[currentQuestion]?.question_text}
        </p>

        <div className="space-y-3">
          {questions[currentQuestion]?.options?.map((option, index) => (
            <div
              key={index}
              onClick={() => handleOptionSelect(index)}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition duration-200 ${
                selectedOptions[currentQuestion] === index
                  ? "bg-violet-100 border-violet-500"
                  : "hover:bg-gray-100"
              }`}>
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                checked={selectedOptions[currentQuestion] === index}
                onChange={() => handleOptionSelect(index)}
                className="mr-3"
              />
              <span>{option}</span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button
            onClick={handleFlagQuestion}
            className={`px-4 py-2 rounded-lg ${
              flaggedQuestions[currentQuestion]
                ? "bg-yellow-400"
                : "bg-gray-300"
            }`}>
            {flaggedQuestions[currentQuestion]
              ? "Unflag for Review"
              : "Flag for Review"}
          </button>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={handlePreviousQuestion}
            className="bg-[#8b5dff] hover:bg-[#7a4bc4] text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
            disabled={currentQuestion === 0}>
            Previous Question
          </button>
          <button
            onClick={handleNextQuestion}
            className="bg-[#8b5dff] hover:bg-[#7a4bc4] text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
            disabled={loading}>
            {currentQuestion === questions.length - 1
              ? "Submit"
              : "Next Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
