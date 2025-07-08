"use client";
import { useState } from "react";

export default function TeacherProfile() {
  const [userData, setUserData] = useState({
    name: "Jane Smith",
    email: "jane.smith@example.com",
    teacherId: "TCH2024001",
    department: "Mathematics",
    subjects: ["Algebra", "Geometry", "Calculus"],
    avatar: null,
    contactNumber: "+1234567890",
    address: "456 Education Street, Learning City, 12345",
    bio: "Experienced mathematics teacher with 10 years of experience.",
    qualifications: ["M.Sc Mathematics", "B.Ed"],
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
        <h2 className="text-2xl font-bold text-gray-800">Teacher Profile</h2>
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
            <label className="text-sm text-gray-600">Teacher ID</label>
            <p className="font-medium text-gray-800">{userData.teacherId}</p>
          </div>
        </div>

        {/* Professional Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Professional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600">Department</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.department}
                  onChange={(e) =>
                    setEditedData({ ...editedData, department: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg mt-1"
                />
              ) : (
                <p className="font-medium text-gray-800">
                  {userData.department}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600">Subjects</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.subjects.join(", ")}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      subjects: e.target.value.split(", "),
                    })
                  }
                  className="w-full p-2 border rounded-lg mt-1"
                />
              ) : (
                <p className="font-medium text-gray-800">
                  {userData.subjects.join(", ")}
                </p>
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
