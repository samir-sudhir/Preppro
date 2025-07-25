"use client";

import { useState } from "react";
import api from "../../../../api";
import toast from "react-hot-toast";
import {
  HiCheckCircle,
  HiOutlineClipboardCopy,
  HiPencil,
  HiTrash,
} from "react-icons/hi";
import { Dialog } from "@headlessui/react";

export default function AutoMCQ({ setActiveComponent }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [editQuestion, setEditQuestion] = useState(null);
  const [showCreateTestDialog, setShowCreateTestDialog] = useState(false);
  const [formData, setFormData] = useState({
    text: "",
    num_questions: 5,
    difficulty: "medium",
    subject: "",
    topic: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setQuestions([]);

    try {
      const response = await api.post("/generate-questions/", formData);

      if (response.data.questions) {
        setQuestions(response.data.questions);
        toast.success("Questions generated successfully!");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to generate questions";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleEditQuestion = (index) => {
    setEditQuestion({ ...questions[index], index });
  };

  const handleUpdateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
    setEditQuestion(null);
    toast.success("Question updated successfully!");
  };

  const handleCreateTest = async () => {
    try {
      // First save all questions to the database
      const savedQuestions = await Promise.all(
        questions.map(async (q) => {
          const response = await api.post("/questions/create/", {
            question: q.question_text,
            options: q.options,
            correct_answer: q.options.indexOf(q.correct_answer),
            subject: formData.subject,
            topic: formData.topic,
            difficulty: q.difficulty,
          });
          return response.data.id;
        })
      );

      // Store the question IDs and test data in localStorage
      localStorage.setItem(
        "autoGeneratedTestData",
        JSON.stringify({
          subject: formData.subject,
          topic: formData.topic,
          difficulty: formData.difficulty,
          questionIds: savedQuestions,
        })
      );

      // Navigate to create test page using setActiveComponent
      setActiveComponent("create-test");
      toast.success("Questions saved! Please complete test details.");
    } catch (error) {
      toast.error("Failed to create test. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fff]">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Auto Question Generator
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="text">
                  Input Text
                </label>
                <textarea
                  id="text"
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] resize-none"
                  required
                  placeholder="Enter the text to generate questions from..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="num_questions">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    id="num_questions"
                    name="num_questions"
                    value={formData.num_questions}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="20"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="difficulty">
                    Difficulty
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="subject">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="e.g., Biology"
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="topic">
                    Topic
                  </label>
                  <input
                    type="text"
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="e.g., Photosynthesis"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#8b5dff] text-white py-3 px-4 rounded-lg hover:bg-[#7a4bc4] focus:outline-none focus:ring-2 focus:ring-[#8b5dff] focus:ring-opacity-50 transition-all duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}>
                {loading ? "Generating Questions..." : "Generate Questions"}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Generated Questions Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Generated Questions
              </h2>
              {questions.length > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {questions.length} questions
                  </span>
                  <button
                    onClick={() => setShowCreateTestDialog(true)}
                    className="px-4 py-2 bg-[#8b5dff] text-white rounded-lg hover:bg-[#7a4bc4] transition-colors">
                    Create Test
                  </button>
                </div>
              )}
            </div>

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#8b5dff] mb-4"></div>
                <p className="text-gray-600 font-medium">
                  Generating questions...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few moments
                </p>
              </div>
            )}

            {/* Empty State */}
            {!loading && questions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Questions Generated Yet
                </h3>
                <p className="text-gray-500 max-w-sm">
                  Enter your text and parameters on the left to generate
                  multiple-choice questions.
                </p>
              </div>
            )}

            {/* Questions List */}
            {questions.length > 0 && (
              <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {questions.map((q, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    {editQuestion?.index === index ? (
                      <div className="space-y-4">
                        <textarea
                          value={editQuestion.question_text}
                          onChange={(e) =>
                            setEditQuestion({
                              ...editQuestion,
                              question_text: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          rows="3"
                        />
                        <div className="space-y-2">
                          {editQuestion.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className="flex items-center gap-3">
                              <input
                                type="radio"
                                checked={editQuestion.correct_answer === option}
                                onChange={() =>
                                  setEditQuestion({
                                    ...editQuestion,
                                    correct_answer: option,
                                  })
                                }
                                className="w-4 h-4 text-blue-600"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...editQuestion.options];
                                  newOptions[optIndex] = e.target.value;
                                  setEditQuestion({
                                    ...editQuestion,
                                    options: newOptions,
                                  });
                                }}
                                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditQuestion(null)}
                            className="px-3 py-1 border rounded-lg hover:bg-gray-100">
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateQuestion(index, editQuestion)
                            }
                            className="px-3 py-1 bg-[#8b5dff] text-white rounded-lg hover:bg-[#7a4bc4]">
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 flex-1">
                            {index + 1}. {q.question_text}
                          </h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditQuestion(index)}
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                              <HiPencil className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => copyToClipboard(q.question_text)}
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                              <HiOutlineClipboardCopy className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {q.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg border transition-all duration-200 ${
                                option === q.correct_answer
                                  ? "bg-green-50 border-green-200"
                                  : "bg-white border-gray-200 hover:bg-gray-50"
                              }`}>
                              <div className="flex items-center">
                                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 mr-3">
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                <span className="flex-1">{option}</span>
                                {option === q.correct_answer && (
                                  <HiCheckCircle className="w-5 h-5 text-green-500 ml-2" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              q.difficulty === "easy"
                                ? "bg-green-100 text-green-700"
                                : q.difficulty === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                            {q.difficulty}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                            {q.subject}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                            {q.topic}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Test Confirmation Dialog */}
      <Dialog
        open={showCreateTestDialog}
        onClose={() => setShowCreateTestDialog(false)}
        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Create Test from Generated Questions
          </h2>
          <p className="text-gray-600 mb-4">
            This will save all generated questions to the database and redirect
            you to the test creation page where you can complete the test
            details.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowCreateTestDialog(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleCreateTest}
              className="px-4 py-2 bg-[#8b5dff] text-white rounded-lg hover:bg-[#7a4bc4]">
              Create Test
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
