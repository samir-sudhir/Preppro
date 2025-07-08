"use client";

import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify"; // ✅ Import ToastContainer
import "react-toastify/dist/ReactToastify.css";
import api from "../../api"; // Import Axios instance

export default function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/users/login/", formData);
      if (response.status === 200) {
        // Store the complete user data and token
        localStorage.setItem("userData", JSON.stringify(response.data.user));
        localStorage.setItem("authToken", response.data.tokens.access);
        localStorage.setItem("refreshToken", response.data.tokens.refresh);

        // Redirect based on role
        if (response.data.user.role === "teacher") {
          router.push("/dashboard/teachers");
        } else {
          router.push("/dashboard/students");
        }
      }
    } catch (err) {
      if (err.response?.data) {
        const errors = err.response.data;
        Object.keys(errors).forEach((key) => {
          toast.error(errors[key][0]);
        });
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-r from-[#fff7d1] to-[#ffeebb] font-sans">
      <ToastContainer position="top-right" autoClose={3000} />{" "}
      {/* ✅ Add ToastContainer */}
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Login</title>
        <link rel="icon" href="/assets/favicon.ico" type="image/x-icon" />
      </Head>
      <video
        autoPlay
        loop
        muted
        className="absolute top-5 left-5 max-w-[150px] h-[7.7rem] z-10 rounded-lg">
        <source src="/assets/logo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="container mx-auto flex flex-col md:flex-row justify-center items-center h-screen">
        <div className="hidden md:flex justify-center w-1/2 m-10">
          <img
            src="/assets/login.png"
            alt="Login Animation"
            className="rounded-lg max-w-full"
          />
        </div>
        <div className="w-full md:w-1/3 ml-4">
          <div className="max-w-sm mx-auto p-8 bg-gray-50 rounded-lg shadow-2xl mt-20 h-auto">
            <h2 className="text-center text-2xl font-bold mb-4 text-gray-800">
              Login
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-800">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-bold mb-2 text-gray-800">
                  Password
                </label>
                <div className="flex items-center border border-gray-300 rounded">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="flex-1 p-2 text-gray-800 rounded-l focus:outline-none"
                    required
                    placeholder="Enter your password"
                  />
                  <span
                    className="flex items-center justify-center p-2 cursor-pointer bg-white rounded-r"
                    onClick={togglePasswordVisibility}>
                    {passwordVisible ? (
                      <FaEyeSlash className="text-gray-600 text-lg" />
                    ) : (
                      <FaEye className="text-gray-600 text-lg" />
                    )}
                  </span>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#8b5dff] text-white py-2 rounded hover:bg-[#7a4bc4] transition duration-200"
                disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>

              {/* Forgot Password Link */}
              <p className="text-center text-sm">
                <a
                  href="login/forgot-password"
                  className="text-[#8b5dff] hover:underline">
                  Forgot Password?
                </a>
              </p>
            </form>
            {/* Horizontal line */}
            <hr className="my-4 border-gray-300" />

            <p className="text-center mt-3 text-gray-800">
              Don't have an account?{" "}
              <a href="/signup" className="text-[#8b5dff] hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
