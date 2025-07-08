"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../../api"; // Ensure you have axios setup with baseURL

const AddQuestion = () => {
  const [questionData, setQuestionData] = useState({
    question: "",
    options: ["", "", "", ""],
    correct_answer: 0,
    subject: "",
    topic: "",
    difficulty: "medium",
    explanation: "",
  });

  const difficulties = ["easy", "medium", "hard"];
  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
  ];

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionData.options];
    newOptions[index] = value;
    setQuestionData({ ...questionData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Unauthorized: No token found.");

      const response = await api.post("/questions/create/", questionData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Question created successfully!");
      setQuestionData({
        question: "",
        options: ["", "", "", ""],
        correct_answer: 0,
        subject: "",
        topic: "",
        difficulty: "medium",
        explanation: "",
      });
    } catch (err) {
      toast.error("Failed to add question.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Add New Question
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text
          </label>
          <textarea
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows="3"
            value={questionData.question}
            onChange={(e) =>
              setQuestionData({ ...questionData, question: e.target.value })
            }
            required
          />
        </div>

        {/* Options */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Options
          </label>
          {questionData.options.map((option, index) => (
            <div key={index} className="flex gap-4 items-center">
              <input
                type="radio"
                name="correct_answer"
                checked={questionData.correct_answer === index}
                onChange={() =>
                  setQuestionData({ ...questionData, correct_answer: index })
                }
                className="w-4 h-4 text-blue-600"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder={`Option ${index + 1}`}
                required
              />
            </div>
          ))}
        </div>

        {/* Subject and Difficulty */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={questionData.subject}
              onChange={(e) =>
                setQuestionData({ ...questionData, subject: e.target.value })
              }
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required>
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={questionData.difficulty}
              onChange={(e) =>
                setQuestionData({ ...questionData, difficulty: e.target.value })
              }
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required>
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic
          </label>
          <input
            type="text"
            value={questionData.topic}
            onChange={(e) =>
              setQuestionData({ ...questionData, topic: e.target.value })
            }
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter topic"
            required
          />
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation (Optional)
          </label>
          <textarea
            value={questionData.explanation}
            onChange={(e) =>
              setQuestionData({ ...questionData, explanation: e.target.value })
            }
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows="3"
            placeholder="Explain the correct answer..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            onClick={() =>
              setQuestionData({
                question: "",
                options: ["", "", "", ""],
                correct_answer: 0,
                subject: "",
                topic: "",
                difficulty: "medium",
                explanation: "",
              })
            }>
            Clear
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#8b5dff] text-white rounded-lg hover:bg-[#7a4bc4]">
            Add Question
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddQuestion;
