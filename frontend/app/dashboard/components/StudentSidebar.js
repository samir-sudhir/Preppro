// app/dashboard/components/StudentSidebar.js
"use client";
import React, { useState } from "react";
import {
  FaHome,
  FaClipboardList,
  FaHistory,
  FaChartBar,
  FaMagic,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

export default function StudentSidebar({ onMenuSelect, activeComponent }) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div
      className={`${
        isMinimized ? "w-20" : "w-64"
      } h-screen text-white transition-all duration-300 relative`}
      style={{
        backgroundImage: "linear-gradient(140deg, #7a4bc4, #8b5dff, #ff37ff)",
      }}>
      {/* Header */}
      <div className={`p-6 ${isMinimized ? "p-4" : ""}`}>
        <h2
          className={`text-2xl font-bold mb-8 transition-all duration-300 ${
            isMinimized ? "text-center text-lg" : ""
          }`}>
          {isMinimized ? "" : "Student Portal"}
        </h2>

        {/* Minimize Button */}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="absolute right-2 top-6 bg-white text-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-40 transition">
          {isMinimized ? (
            <FaAngleDoubleRight size={16} />
          ) : (
            <FaAngleDoubleLeft size={16} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`space-y-1 ${isMinimized ? "px-2" : "px-6"}`}>
        <button
          onClick={() => onMenuSelect("dashboard")}
          className={`w-full px-4 py-3 flex items-center ${
            isMinimized ? "justify-center" : "space-x-3"
          } transition-colors hover:bg-white/10 rounded-lg ${
            activeComponent === "dashboard"
              ? "bg-white/20 border-l-4 border-white"
              : ""
          }`}>
          <FaHome className="text-xl" />
          {!isMinimized && <span className="font-medium">Dashboard</span>}
        </button>

        <button
          onClick={() => onMenuSelect("tests")}
          className={`w-full px-4 py-3 flex items-center ${
            isMinimized ? "justify-center" : "space-x-3"
          } transition-colors hover:bg-white/10 rounded-lg ${
            activeComponent === "tests"
              ? "bg-white/20 border-l-4 border-white"
              : ""
          }`}>
          <FaClipboardList className="text-xl" />
          {!isMinimized && <span className="font-medium">Active Tests</span>}
        </button>

        <button
          onClick={() => onMenuSelect("history")}
          className={`w-full px-4 py-3 flex items-center ${
            isMinimized ? "justify-center" : "space-x-3"
          } transition-colors hover:bg-white/10 rounded-lg ${
            activeComponent === "history"
              ? "bg-white/20 border-l-4 border-white"
              : ""
          }`}>
          <FaHistory className="text-xl" />
          {!isMinimized && <span className="font-medium">Test History</span>}
        </button>

        <button
          onClick={() => onMenuSelect("performance")}
          className={`w-full px-4 py-3 flex items-center ${
            isMinimized ? "justify-center" : "space-x-3"
          } transition-colors hover:bg-white/10 rounded-lg ${
            activeComponent === "performance"
              ? "bg-white/20 border-l-4 border-white"
              : ""
          }`}>
          <FaChartBar className="text-xl" />
          {!isMinimized && <span className="font-medium">My Performance</span>}
        </button>

        <button
          onClick={() => onMenuSelect("practice")}
          className={`w-full px-4 py-3 flex items-center ${
            isMinimized ? "justify-center" : "space-x-3"
          } transition-colors hover:bg-white/10 rounded-lg ${
            activeComponent === "practice"
              ? "bg-white/20 border-l-4 border-white"
              : ""
          }`}>
          <FaMagic className="text-xl" />
          {!isMinimized && <span className="font-medium">Smart Prep</span>}
        </button>
      </nav>
    </div>
  );
}
