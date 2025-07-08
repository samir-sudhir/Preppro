"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "../../../../api";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await api.get("/tests/feedback/list/");
      setFeedbacks(response.data);
    } catch (error) {
      toast.error("Failed to fetch feedback requests");
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-600">Student Feedback </h2>

      <div className="grid gap-4">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{feedback.test_title}</h3>
                <p className="text-gray-600">
                  Student: {feedback.student_name}
                </p>
                <p className="text-gray-600 mt-2">
                  <span className="font-medium">Student's Request:</span>{" "}
                  {feedback.comments}
                </p>
                {feedback.teacher_response && (
                  <p className="text-gray-600 mt-2">
                    <span className="font-medium">Your Response:</span>{" "}
                    {feedback.teacher_response}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Response Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Provide Feedback</h3>
            <div className="mb-4">
              <p className="font-semibold">
                Test: {selectedFeedback.test_title}
              </p>
              <p>Student: {selectedFeedback.student_name}</p>
              <p className="mt-2">
                <span className="font-medium">Student's Request:</span>{" "}
                {selectedFeedback.comments}
              </p>
            </div>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full h-32 p-2 border rounded-lg mb-4"
              placeholder="Enter your feedback response..."
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setSelectedFeedback(null);
                  setFeedbackText("");
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => handleSubmitFeedback(selectedFeedback.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Submit Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
