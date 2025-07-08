"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../../api";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPasswordVisibility = () =>
    setConfirmPasswordVisible(!confirmPasswordVisible);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/users/register/", formData);
      if (response.status === 201) {
        // Store both the role and auth token
        localStorage.setItem("userRole", formData.role);
        localStorage.setItem("authToken", response.data.tokens.access);
        toast.success("Signup successful. Please login.");
        router.push("/login");
      }
    } catch (err) {
      if (err.response?.data) {
        const errors = err.response.data;
        Object.keys(errors).forEach((key) => {
          toast.error(errors[key][0]);
        });
      } else {
        toast.error("Signup failed. Please check your details.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="bg-[#fff7d1] font-sans">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Signup</title>
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
        <div className="hidden md:flex justify-center w-1/2 mx-auto">
          <img
            src="/assets/signup.png"
            alt="Signup"
            className="rounded-lg max-w-full"
          />
        </div>
        <div className="w-full md:w-1/3 mt-5 px-6">
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-center text-xl font-semibold mb-4 text-gray-800">
              Sign Up
            </h2>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-800">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-800">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="mb-4 relative">
                <label className="block text-sm font-semibold mb-2 text-gray-800">
                  Password
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="flex-1 p-2 text-gray-800 rounded-l-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                    required
                  />
                  <span
                    className="p-2 cursor-pointer bg-white rounded-r-lg"
                    onClick={togglePasswordVisibility}>
                    {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
              <div className="mb-4 relative">
                <label className="block text-sm font-semibold mb-2 text-gray-800">
                  Confirm Password
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="flex-1 p-2 text-gray-800 rounded-l-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm your password"
                    required
                  />
                  <span
                    className="p-2 cursor-pointer bg-white rounded-r-lg"
                    onClick={toggleConfirmPasswordVisibility}>
                    {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-800">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-[#8b5dff] text-white py-2 rounded-lg hover:bg-[#7a4bc4] transition duration-200"
                disabled={loading}>
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </form>
            <p className="text-center mt-4 text-gray-800">
              Already have an account?{" "}
              <a href="/login" className="text-[#8b5dff] hover:underline">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
