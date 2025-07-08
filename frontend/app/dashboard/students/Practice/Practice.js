"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "../../../../api";

const Practice = () => {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [practiceSessions, setPracticeSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchPracticeSessions();
  }, []);

  const fetchPracticeSessions = async () => {
    try {
      const response = await api.get("/practice/");
      setPracticeSessions(response.data);
    } catch (error) {
      toast.error("Failed to fetch practice sessions");
      console.error("Error fetching practice sessions:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) {
      toast.error("Please enter some text to practice");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.post("/practice/", {
        input_text: inputText,
      });

      toast.success("Practice session created! Processing your text...");
      setInputText("");

      // Poll for updates until processing is complete
      const pollInterval = setInterval(async () => {
        const sessionResponse = await api.get(`/practice/${response.data.id}/`);
        if (sessionResponse.data.status === "completed") {
          clearInterval(pollInterval);
          setIsProcessing(false);
          fetchPracticeSessions(); // Refresh the list
          toast.success("Practice session completed!");
        } else if (sessionResponse.data.status === "failed") {
          clearInterval(pollInterval);
          setIsProcessing(false);
          toast.error(
            "Failed to process text: " + sessionResponse.data.error_message
          );
        }
      }, 2000); // Poll every 2 seconds
    } catch (error) {
      setIsProcessing(false);
      toast.error("Failed to create practice session");
      console.error("Error creating practice session:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Text Input Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Practice with Your Text
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text here to generate practice questions and summary..."
            className="w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none focus:outline-none"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing}
            className={`px-6 py-2 rounded-lg text-white font-medium ${
              isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#8b5dff] hover:bg-[#7a4bc4]"
            }`}>
            {isProcessing ? "Processing..." : "Generate Practice"}
          </button>
        </form>
      </div>

      {/* Practice Sessions List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Your Prep Sessions
        </h2>
        <div className="space-y-4">
          {practiceSessions.map((session) => (
            <div
              key={session.id}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedSession(session)}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">
                    {new Date(session.created_at).toLocaleString()}
                  </p>
                  <p className="text-gray-800 mt-1 line-clamp-2">
                    {session.input_text}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    session.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : session.status === "processing"
                      ? "bg-blue-100 text-blue-800"
                      : session.status === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                  {session.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Session Details Modal */}
      {selectedSession && selectedSession.status === "completed" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">Smart Prep</h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            {/* Summary Section */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Summary & Key Points
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                {selectedSession.summary_points.map((point, index) => {
                  // Check if it's a markdown heading (starts with ###)
                  if (point.trim().startsWith("###")) {
                    return (
                      <h5
                        key={index}
                        className="font-bold text-gray-800 text-xl mt-4 mb-2">
                        {point.replace("###", "").trim()}
                      </h5>
                    );
                  }
                  // Check if it's a bullet point
                  else if (
                    point.trim().startsWith("•") ||
                    point.trim().startsWith("-")
                  ) {
                    const formattedText = point
                      .replace(/^[•-]\s*/, "")
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                    return (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-[#8b5dff] mt-1">•</span>
                        <p
                          className="text-gray-700"
                          dangerouslySetInnerHTML={{ __html: formattedText }}
                        />
                      </div>
                    );
                  }
                  // Regular text
                  else {
                    const formattedText = point.replace(
                      /\*\*(.*?)\*\*/g,
                      "<strong>$1</strong>"
                    );
                    return (
                      <p
                        key={index}
                        className="text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formattedText }}
                      />
                    );
                  }
                })}
              </div>
            </div>

            {/* MCQs Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Practice Questions
              </h4>
              <div className="space-y-4">
                {selectedSession.generated_questions.map((question, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white">
                    <p className="font-medium mb-3 text-gray-800">
                      {" "}
                      {question.question_text}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg transition-colors ${
                            option === question.correct_answer
                              ? "bg-green-50 border-2 border-green-500"
                              : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                          }`}>
                          <span className="font-medium text-gray-700">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>{" "}
                          <span className="text-gray-700">{option}</span>
                          {option === question.correct_answer && (
                            <span className="ml-2 text-green-600 text-sm font-medium">
                              ✓ Correct Answer
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Practice;
