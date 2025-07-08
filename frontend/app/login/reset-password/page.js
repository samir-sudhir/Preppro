"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../../api"; // Import Axios instance

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract uidb64 and token from URL
  const uidb64 = searchParams.get("uidb64");
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!uidb64 || !token) {
      toast.error("Invalid or missing reset link.");
      return;
    }

    try {
      const response = await api.post(
        `/users/reset-password/?uidb64=${uidb64}&token=${token}`,
        {
          new_password: password,
          confirm_password: confirmPassword,
        }
      );

      console.log("API Response:", response.data);

      // ✅ Only trigger success toast when the request succeeds
      toast.success("Password reset successfully!", {
        onClose: () => router.push("/login"), // ✅ Redirect after toast disappears
      });
    } catch (error) {
      console.error("API Error:", error.response?.data);
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-[#fff7d1] to-[#ffeebb]">
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-md p-8 border-2 border-gray-300 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Reset Password
        </h1>
        <p className="text-gray-600 text-sm text-center mb-4">
          Enter a new password to reset your account.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-4 bg-[#8b5dff] hover:bg-[#7a4bc4] text-white font-semibold rounded-lg shadow-md transition duration-300">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
