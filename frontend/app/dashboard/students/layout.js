"use client";
import { useState, useEffect } from "react";
import StudentSidebar from "../components/StudentSidebar";
import Header from "../components/Header";
import ActiveTests from "./Tests/ActiveTests";
import TestHistory from "./Tests/TestHistory";
import Performance from "./Performance/Performance";
import Practice from "./Practice/Practice";
import Profile from "./Profile/Profile";
import Dashboard from "./page";

export default function StudentLayout() {
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
      case "tests":
        return <ActiveTests />;
      case "history":
        return <TestHistory />;
      case "performance":
        return <Performance />;
      case "practice":
        return <Practice />;
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-700">
                  Active Tests
                </h3>
                <p className="text-3xl font-bold text-blue-900">5</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-700">
                  Completed Tests
                </h3>
                <p className="text-3xl font-bold text-green-900">12</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-700">
                  Average Score
                </h3>
                <p className="text-3xl font-bold text-purple-900">82%</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-700">
                  Practice Sessions
                </h3>
                <p className="text-3xl font-bold text-yellow-900">15</p>
              </div>
            </div>

            {/* Active Tests Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Active Tests
              </h2>
              <ActiveTests />
            </div>

            {/* Recent Performance */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Recent Performance
              </h2>
              <Performance />
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                My Profile
              </h2>
              <Profile />
            </div>
          </div>
        );

      default:
        return <div className="text-gray-700">Page Not Found</div>;
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen ">
      <StudentSidebar
        onMenuSelect={handleMenuSelect}
        activeComponent={activeComponent}
      />

      <div className="flex-1 flex flex-col relative">
        <Header
          isHidden={isHidden}
          userRole="student"
          setActiveComponent={setActiveComponent} // Pass setActiveComponent to Header
        />

        <main className="flex-1 overflow-auto p-8 pt-16">
          <div className="max-w-7xl mx-auto">{renderComponent()}</div>
        </main>
      </div>
    </div>
  );
}
