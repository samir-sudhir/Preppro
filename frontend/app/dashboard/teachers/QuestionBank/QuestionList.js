"use client";

import { useState, useEffect } from "react";
import { HiPencil, HiTrash, HiSearch } from "react-icons/hi"; // Import icons
import api from "../../../../api";
import toast from "react-hot-toast";
import { Dialog } from "@headlessui/react";

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editQuestion, setEditQuestion] = useState(null);
  const [deleteQuestion, setDeleteQuestion] = useState(null);

  const getToken = async () => {
    let token = null;
    for (let i = 0; i < 10; i++) {
      token = localStorage.getItem("authToken");
      if (token) break;
      await new Promise((res) => setTimeout(res, 100));
    }
    return token;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        if (!token) throw new Error("Unauthorized: No token found.");

        const response = await api.get("/questions/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setQuestions(response.data.data);
        setFilteredQuestions(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Add search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredQuestions(questions);
      return;
    }

    const searchLower = searchQuery.toLowerCase();
    const filtered = questions.filter((question) => {
      return (
        question.question.toLowerCase().includes(searchLower) ||
        question.subject.toLowerCase().includes(searchLower) ||
        question.topic.toLowerCase().includes(searchLower) ||
        question.difficulty.toLowerCase().includes(searchLower) ||
        question.options.some((option) =>
          option.toLowerCase().includes(searchLower)
        )
      );
    });
    setFilteredQuestions(filtered);
  }, [searchQuery, questions]);

  const handleDeleteQuestion = async () => {
    if (!deleteQuestion) return;

    try {
      const token = await getToken();
      if (!token) throw new Error("Unauthorized: No token found.");

      await api.delete(`/questions/${deleteQuestion.id}/delete/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setQuestions(questions.filter((q) => q.id !== deleteQuestion.id));
      toast.success("Question deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete question.");
    } finally {
      setDeleteQuestion(null);
    }
  };
  const handleUpdateQuestion = async (id, updatedQuestion) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Unauthorized: No token found.");

      const response = await api.put(
        `/questions/${id}/update/`,
        updatedQuestion,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setQuestions((prevQuestions) =>
        prevQuestions.map((q) => (q.id === id ? response.data.data : q))
      );

      setEditQuestion(null); // Close edit mode
      toast.success("Question updated successfully!");
    } catch (err) {
      toast.error("Failed to update question.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search questions, subjects, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading && (
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
      )}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-4">
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="border rounded-lg p-4 hover:bg-gray-50 shadow">
              {editQuestion?.id === question.id ? (
                <div>
                  <input
                    type="text"
                    className="border p-2 w-full rounded text-lg font-medium focus:ring-2 focus: ring-blue-500 focus:outline-none"
                    value={editQuestion.question}
                    onChange={(e) =>
                      setEditQuestion({
                        ...editQuestion,
                        question: e.target.value,
                      })
                    }
                  />

                  <div className="mt-4">
                    {editQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3 mb-2">
                        <input
                          type="radio"
                          name={`correct_answer_${editQuestion.id}`}
                          checked={editQuestion.correct_answer === index}
                          onChange={() =>
                            setEditQuestion({
                              ...editQuestion,
                              correct_answer: index,
                            })
                          }
                          className="w-5 h-5 accent-[#8b5dff] "
                        />
                        <input
                          type="text"
                          className="border p-2 flex-grow rounded w-full focus:ring-2 focus: ring-blue-500 focus:outline-none"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...editQuestion.options];
                            newOptions[index] = e.target.value;
                            setEditQuestion({
                              ...editQuestion,
                              options: newOptions,
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-3">
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded"
                      onClick={() =>
                        handleUpdateQuestion(question.id, editQuestion)
                      }>
                      Save
                    </button>
                    <button
                      className="bg-gray-400 text-white px-4 py-2 rounded"
                      onClick={() => setEditQuestion(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {question.question}
                  </h3>

                  <div className="grid gap-2 mt-2">
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded border w-full ${
                          index === question.correct_answer
                            ? "bg-green-100 border-green-500"
                            : "border-gray-300"
                        }`}>
                        <input
                          type="radio"
                          disabled
                          checked={index === question.correct_answer}
                          className="w-5 h-5 accent-[#8b5dff]"
                        />
                        <span className="text-gray-800">{option}</span>
                      </div>
                    ))}
                  </div>

                  {/* Colored boxes for Subject, Topic, and Difficulty */}
                  <div className="mt-3 flex gap-3">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm">
                      {question.subject}
                    </span>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm">
                      {question.topic}
                    </span>
                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        question.difficulty === "Easy"
                          ? "bg-green-100 text-green-700"
                          : question.difficulty === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                      {question.difficulty}
                    </span>
                  </div>

                  {/* Edit and Delete Icons */}
                  <div className="mt-3 flex gap-4">
                    <button
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-transparent text-blue-600 text-sm font-medium transition-all duration-300 
  hover:border-blue-600 hover:bg-blue-100 hover:shadow-md hover:shadow-blue-300"
                      onClick={() => setEditQuestion(question)}>
                      <HiPencil className="text-xl" />
                    </button>
                    <button
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-transparent text-red-600 text-sm font-medium transition-all duration-300 
  hover:border-red-600 hover:bg-red-100 hover:shadow-md hover:shadow-red-300"
                      onClick={() => setDeleteQuestion(question)}>
                      <HiTrash className="text-xl" />
                    </button>

                    {/* <HiTrash
                      className="text-red-600 hover:text-red-800 cursor-pointer text-xl"
                      onClick={() => setDeleteQuestion(question)}
                    /> */}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deleteQuestion}
        onClose={() => setDeleteQuestion(null)}
        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-lg font-semibold text-gray-900">
            Confirm Deletion
          </h2>
          <p className="text-gray-600 mt-2">
            Are you sure you want to delete this question?
          </p>

          <div className="mt-4 flex justify-end gap-3">
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => setDeleteQuestion(null)}>
              Cancel
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded"
              onClick={handleDeleteQuestion}>
              Delete
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default QuestionList;
