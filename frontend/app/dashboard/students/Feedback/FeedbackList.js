"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "../../../../api";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await api.get("/tests/feedback/list/");
      setFeedbacks(response.data);
    } catch (error) {
      toast.error("Failed to fetch feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (feedbackId) => {
    try {
      await api.post(`/tests/feedback/${feedbackId}/mark-read/`);
      setFeedbacks(
        feedbacks.map((fb) =>
          fb.id === feedbackId ? { ...fb, is_read: true } : fb
        )
      );
    } catch (error) {
      toast.error("Failed to mark feedback as read");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Feedback</h2>

      <div className="grid gap-4">
        {feedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className={`bg-white p-4 rounded-lg shadow ${
              !feedback.is_read ? "border-l-4 border-blue-500" : ""
            }`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{feedback.test_title}</h3>
                <p className="text-gray-600">Score: {feedback.score}%</p>
                <p className="text-gray-600 mt-2">{feedback.feedback_text}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Feedback from: {feedback.teacher_name}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(feedback.created_at).toLocaleString()}
                </p>
              </div>
              {!feedback.is_read && (
                <button
                  onClick={() => markAsRead(feedback.id)}
                  className="text-blue-500 hover:text-blue-700">
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        ))}
        {feedbacks.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No feedback available yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default FeedbackList;
