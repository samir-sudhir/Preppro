"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "../../../../api";

const RequestFeedback = ({ attempt }) => {
  const [feedbackText, setFeedbackText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      toast.error("Please enter your feedback request");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/tests/feedback/", {
        attempt: attempt.id,
        feedback_text: feedbackText,
      });

      if (response.data) {
        toast.success("Feedback request submitted successfully");
        setFeedbackText("");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to submit feedback request";
      toast.error(errorMessage);
      console.error("Feedback request error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Request Feedback</h3>
      <div className="mb-4">
        <p className="font-semibold">Test: {attempt.test.title}</p>
        <p>Your Score: {attempt.score}%</p>
      </div>
      <textarea
        value={feedbackText}
        onChange={(e) => setFeedbackText(e.target.value)}
        className="w-full h-32 p-2 border rounded-lg mb-4"
        placeholder="What specific feedback would you like about your performance?"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSubmitFeedback}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
          {loading ? "Submitting..." : "Submit Feedback Request"}
        </button>
      </div>
    </div>
  );
};

export default RequestFeedback;
