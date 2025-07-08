"use client";

import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify"; //  Import ToastContainer
import "react-toastify/dist/ReactToastify.css";
import api from "../../../api"; // Import Axios instance

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(0);

  //  Timer function
  const startTimer = () => {
    setTimer(30);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  //  Handle Forgot Password API Call
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/users/forgot-password/", { email });

      console.log("API Response:", response.data); // Debugging

      //  Show success toast
      toast.success(response.data.message || "Password reset email sent!", {
        position: "top-right",
        autoClose: 3000,
      });

      startTimer();
    } catch (error) {
      console.error("API Error:", error.response?.data); // Debugging
      toast.error(
        error.response?.data?.message || "Failed to send reset email.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-[#fff7d1] to-[#ffeebb]">
      {/*  Ensure ToastContainer is added here */}
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-md p-8 border-2 border-gray-300 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Forgot Password
        </h1>
        <p className="text-gray-600 text-sm text-center mb-4">
          Enter your email to receive a password reset link.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={timer > 0}
            className={`w-full py-2 mt-4 text-white font-semibold rounded-lg shadow-md transition duration-300 ${
              timer > 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#8b5dff] hover:bg-[#7a4bc4]"
            }`}>
            {timer > 0 ? `Resend in ${timer}s` : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
