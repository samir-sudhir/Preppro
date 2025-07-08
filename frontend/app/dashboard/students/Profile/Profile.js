"use client";
import { useState } from "react";

const Profile = () => {
  // Sample user data - will be fetched from API
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Student Profile</h2>
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className={`px-4 py-2 rounded-lg font-medium ${
            isEditing
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}>
          {isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      {/* Profile Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                {userData.avatar ? (
                  <img
                    src={userData.avatar}
                    alt={userData.name}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-gray-500">
                    {userData.name.charAt(0)}
                  </span>
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="font-medium text-gray-800">
                    {userData.studentId}
                  </p>
                </div>
              </div>
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
                  <p className="font-medium text-gray-800">
                    {userData.section}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600">Join Date</label>
                <p className="font-medium text-gray-800">
                  {new Date(userData.joinDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Subjects</label>
                <p className="font-medium text-gray-800">
                  {userData.subjects.join(", ")}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-6 mt-6">
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
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Address</label>
                {isEditing ? (
                  <textarea
                    value={editedData.address}
                    onChange={(e) =>
                      setEditedData({ ...editedData, address: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="font-medium text-gray-800">
                    {userData.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Parent/Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600">Parent Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.parentName}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        parentName: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg mt-1"
                  />
                ) : (
                  <p className="font-medium text-gray-800">
                    {userData.parentName}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600">Parent Contact</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedData.parentContact}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        parentContact: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg mt-1"
                  />
                ) : (
                  <p className="font-medium text-gray-800">
                    {userData.parentContact}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600">Parent Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedData.parentEmail}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        parentEmail: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg mt-1"
                  />
                ) : (
                  <p className="font-medium text-gray-800">
                    {userData.parentEmail}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
