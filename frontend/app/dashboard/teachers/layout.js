"use client";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import TeacherSidebar from "../components/TeacherSidebar";
import QuestionList from "./QuestionBank/QuestionList";
import AddQuestion from "./QuestionBank/AddQuestion";
import GeneratedQuestions from "./AutoMCQ/GeneratedQuestions";
import CreateTest from "./TestManagement/CreateTest";
import TestList from "./TestManagement/TestList";
import AssignTest from "./TestManagement/AssignTest";
import StudentPerformance from "./Analytics/StudentPerformance";
import TestAnalytics from "./Analytics/TestAnalytics";
import AnalyticsPage from "./Analytics/page";
import ClassPerformance from "./Analytics/ClassPerformance";
import FeedbackList from "./Feedback/FeedbackList";
import StudentList from "./Students/StudentList";
import Dashboard from "./page";
import Calendar from "react-calendar";
import { Bar } from "react-chartjs-2";
import Profile from "./profile/page";
// import UserManagement from "./UserManagement/UserManagement";
// import Profile from "../../profile/page"; // Correct path to the Profile component

export default function TeacherLayout() {
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const [mounted, setMounted] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedComponent = localStorage.getItem("activeComponent");
    if (savedComponent) {
      setActiveComponent(savedComponent);
    }
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsHidden(currentScrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  useEffect(() => {
    if (activeComponent) {
      localStorage.setItem("activeComponent", activeComponent);
    }
  }, [activeComponent]);

  const handleMenuSelect = (menuId) => {
    setActiveComponent(menuId);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <Dashboard />;

      case "question-bank":
        return <QuestionList />;
      case "add-question":
        return <AddQuestion />;
      case "auto-mcq":
        return (
          <div className="space-y-6">
            <GeneratedQuestions setActiveComponent={setActiveComponent} />
          </div>
        );
      case "tests":
        return <TestList />;
      case "create-test":
        return <CreateTest setActiveComponent={setActiveComponent} />;
      case "assign-test":
        return <AssignTest setActiveComponent={setActiveComponent} />;
      case "analytics":
        return (
          <div className="space-y-6">
            {/* <StudentPerformance />
            <TestAnalytics />
            <ClassPerformance /> */}
            <AnalyticsPage />
          </div>
        );
      case "feedback":
        return <FeedbackList />;
      case "students":
        return <StudentList />;
      case "profile":
        return <Profile />;
      // case "user-management":
      //   return <UserManagement />;
      default:
        return (
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Page Not Found
            </h2>
            <p>The requested page could not be found.</p>
          </div>
        );
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <TeacherSidebar
        onMenuSelect={handleMenuSelect}
        activeComponent={activeComponent}
      />

      <div className="flex-1 flex flex-col relative">
        <Header
          isHidden={isHidden}
          userRole="teacher"
          setActiveComponent={setActiveComponent} // Pass setActiveComponent to Header
        />
        <main className="flex-1 overflow-auto p-8 pt-16">
          <div className="max-w-7xl mx-auto">{renderComponent()}</div>
        </main>
      </div>
    </div>
  );
}
