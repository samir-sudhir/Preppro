"use client";
import { useState } from "react";

export default function StudentProfile() {
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    studentId: "STU2024001",
    class: "12th Grade",
    section: "A",
    joinDate: "2023-09-01",
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
    avatar: null,
    contactNumber: "+1234567890",
    parentName: "Jane Doe",
    parentEmail: "jane.doe@example.com",
    parentContact: "+1234567891",
    address: "123 Education Street, Learning City, 12345",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(userData);

  const handleSave = async () => {
    try {
      // API call to update profile would go here
      setUserData(editedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Student Profile</h2>
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className={`px-4 py-2 rounded-lg font-medium ${
            isEditing
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      {/* Profile content */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.name}
                onChange={(e) =>
                  setEditedData({ ...editedData, name: e.target.value })
                }
                className="w-full p-2 border rounded-lg mt-1"
              />
            ) : (
              <p className="font-medium text-gray-800">{userData.name}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-600">Student ID</label>
            <p className="font-medium text-gray-800">{userData.studentId}</p>
          </div>
        </div>

        {/* Academic Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Academic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600">Class</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.class}
                  onChange={(e) =>
                    setEditedData({ ...editedData, class: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg mt-1"
                />
              ) : (
                <p className="font-medium text-gray-800">{userData.class}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600">Section</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.section}
                  onChange={(e) =>
                    setEditedData({ ...editedData, section: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg mt-1"
                />
              ) : (
                <p className="font-medium text-gray-800">{userData.section}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedData.email}
                  onChange={(e) =>
                    setEditedData({ ...editedData, email: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg mt-1"
                />
              ) : (
                <p className="font-medium text-gray-800">{userData.email}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600">Contact Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedData.contactNumber}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      contactNumber: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-lg mt-1"
                />
              ) : (
                <p className="font-medium text-gray-800">
                  {userData.contactNumber}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
