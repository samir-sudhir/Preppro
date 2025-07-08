"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "@/api";

export default function Header({ isHidden, userRole, setActiveComponent }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const searchRef = useRef(null);

  const teacherLinks = [
    { id: "dashboard", label: "Overview" },
    { id: "question-bank", label: "Question List" },
    { id: "add-question", label: "Add Question" },
    { id: "auto-mcq", label: "Auto MCQ" },
    { id: "tests", label: "Test List" },
    { id: "create-test", label: "Create Test" },
    { id: "assign-test", label: "Assign Test" },
    { id: "analytics", label: "Performance" },
    { id: "feedback", label: "Feedback" },
    { id: "students", label: "Students" },
  ];

  const studentLinks = [
    { id: "dashboard", label: "Dashboard" },
    { id: "tests", label: "Active Tests" },
    { id: "history", label: "Test History" },
    { id: "performance", label: "My Performance" },
    { id: "practice", label: "Practice" },
  ];

  const allLinks = userRole === "teacher" ? teacherLinks : studentLinks;

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matches = allLinks.filter((link) =>
        link.label.toLowerCase().includes(query)
      );
      setFilteredResults(matches);
    } else {
      setFilteredResults([]);
    }
  }, [searchQuery]);

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("authToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken || !refreshToken) {
        toast.error("No tokens found. Please log in.");
        router.push("/login");
        return;
      }

      await api.post(
        "/users/logout/",
        { refresh: refreshToken },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      localStorage.clear();
      toast.success("Logged out successfully!");
      setTimeout(() => router.push("/login"), 1000);
    } catch {
      toast.error("Logout failed. Please try again.");
      router.push("/login");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const match = filteredResults[0];
    if (match) {
      if (userRole === "teacher" && setActiveComponent) {
        setActiveComponent(match.id); // This is correct for your layout system
      } else if (userRole === "student" && setActiveComponent) {
        // If students use actual routes
        setActiveComponent(match.id); // This is correct for your layout system
      }
      setSearchQuery("");
      setFilteredResults([]);
    } else {
      toast.info("No matching page found.");
    }
  };

  return (
    <header
      className={`bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-500 shadow-md h-16 relative z-50 ${
        isHidden ? "opacity-0 pointer-events-none" : "opacity-100"
      } transition-opacity duration-300`}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/" legacyBehavior>
          <a className="text-2xl font-bold text-white tracking-wide hover:text-gray-200">
            My Dashboard
          </a>
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-1/2 mx-10 flex items-center"
          ref={searchRef}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full px-4 py-2 bg-white bg-opacity-20 rounded-l-full placeholder-white text-white focus:outline-none backdrop-blur-md"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-white bg-opacity-30 text-white rounded-r-full hover:bg-opacity-50 transition">
            Search
          </button>

          {/* Dropdown */}
          {searchQuery && filteredResults.length > 0 && (
            <div className="absolute top-12 w-full bg-white rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
              {filteredResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (userRole === "teacher" && setActiveComponent) {
                      setActiveComponent(item.id);
                    } else if (userRole === "student" && setActiveComponent) {
                      setActiveComponent(item.id);
                    }
                    setSearchQuery("");
                    setFilteredResults([]);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 border-b last:border-none">
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Profile */}
        <div className="relative flex items-center gap-3">
          {userData?.username && (
            <span className="text-white font-medium capitalize">
              {userData.username}
            </span>
          )}
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            onMouseEnter={() => setDropdownOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 transition overflow-hidden">
            {userData?.profile?.profile_photo ? (
              <div className="relative w-full h-full">
                <Image
                  src={userData.profile.profile_photo}
                  alt="Profile"
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ) : (
              <FaUserCircle className="text-white text-2xl" />
            )}
          </button>
          {dropdownOpen && (
            <div
              onMouseLeave={() => setDropdownOpen(false)}
              className="absolute top-14 right-0 bg-white rounded-md shadow-lg overflow-hidden w-44">
              <Link href="/profile" legacyBehavior>
                <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Profile
                </a>
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
