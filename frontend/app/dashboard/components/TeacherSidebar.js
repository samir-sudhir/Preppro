"use client";
import React, { useState } from "react";
import {
  FaUser,
  FaChalkboardTeacher,
  FaBook,
  FaPlus,
  FaRobot,
  FaClipboardList,
  FaPen,
  FaUserGraduate,
  FaChartBar,
  FaComments,
  FaUsers,
  FaUserCog,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

export default function TeacherSidebar({ onMenuSelect, activeComponent }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  const menuGroups = [
    {
      title: "Dashboard",
      icon: <FaChalkboardTeacher />,
      items: [
        { id: "dashboard", label: "Overview", icon: <FaChalkboardTeacher /> },
      ],
    },
    {
      title: "Question Bank",
      icon: <FaBook />,
      items: [
        { id: "question-bank", label: "Question List", icon: <FaBook /> },
        { id: "add-question", label: "Add Question", icon: <FaPlus /> },
        { id: "auto-mcq", label: "Auto MCQ", icon: <FaRobot /> },
      ],
    },
    {
      title: "Test Management",
      icon: <FaClipboardList />,
      items: [
        { id: "tests", label: "Test List", icon: <FaClipboardList /> },
        { id: "create-test", label: "Create Test", icon: <FaPen /> },
        { id: "assign-test", label: "Assign Test", icon: <FaUserGraduate /> },
      ],
    },
    {
      title: "Analytics",
      icon: <FaChartBar />,
      items: [{ id: "analytics", label: "Performance", icon: <FaChartBar /> }],
    },
    {
      title: "Management",
      icon: <FaUserCog />,
      items: [
        { id: "feedback", label: "Feedback", icon: <FaComments /> },
        { id: "students", label: "Students", icon: <FaUsers /> },
        // {
        //   id: "user-management",
        //   label: "User Management",
        //   icon: <FaUserCog />,
        // },
      ],
    },
  ];

  const handleSectionClick = (title) => {
    setOpenSection(openSection === title ? null : title);
  };

  return (
    <div
      className={`${
        isMinimized ? "w-20" : "w-64"
      } h-screen text-white transition-all duration-300 relative`}
      style={{
        backgroundImage: "linear-gradient(140deg, #7a4bc4, #8b5dff, #ff37ff)",
      }}>
      <div className={`p-6 ${isMinimized ? "p-4" : ""}`}>
        <h2
          className={`text-2xl font-bold mb-8 transition-all duration-300 ${
            isMinimized ? "text-center text-lg" : ""
          }`}>
          {isMinimized ? "" : "PrepPro"}
        </h2>

        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="absolute right-2 top-6 text-white bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-40 transition">
          {isMinimized ? (
            <FaAngleDoubleRight size={16} />
          ) : (
            <FaAngleDoubleLeft size={16} />
          )}
        </button>
      </div>

      <nav className={`space-y-1 ${isMinimized ? "px-2" : "px-6"}`}>
        {menuGroups.map((group) => (
          <div key={group.title}>
            <button
              onMouseEnter={() =>
                !isMinimized && handleSectionClick(group.title)
              }
              onClick={() => !isMinimized && handleSectionClick(group.title)}
              className={`w-full px-4 py-3 flex items-center ${
                isMinimized ? "justify-center" : "justify-between"
              } transition-colors hover:bg-white/10 rounded-lg ${
                activeComponent === group.title
                  ? "bg-white/20 border-l-4 border-white"
                  : ""
              }`}
              title={isMinimized ? group.title : ""}>
              <div className="flex items-center space-x-3">
                <span className="text-xl">{group.icon}</span>
                {!isMinimized && (
                  <span className="font-medium">{group.title}</span>
                )}
              </div>
            </button>

            {/* Dropdown Items */}
            {!isMinimized && openSection === group.title && (
              <div className="mt-1 ml-4 space-y-1 border-l-2 border-white/10">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onMenuSelect(item.id)}
                    className={`w-full pl-4 pr-3 py-2 rounded-lg flex items-center space-x-3 transition-colors
                      ${
                        activeComponent === item.id
                          ? "bg-white/20 border-l-4 border-white"
                          : "hover:bg-white/10 text-white/80 hover:text-white"
                      }`}>
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
