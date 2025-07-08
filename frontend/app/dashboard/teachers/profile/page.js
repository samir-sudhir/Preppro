"use client";

import { useState, useEffect } from "react";
import api from "../../../../api";
import toast from "react-hot-toast";
import { HiPencil, HiCheck, HiX } from "react-icons/hi";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
    department: "",
    subjects: [],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/users/profile/");
      setProfile(response.data);
      setFormData({
        first_name: response.data.profile.first_name || "",
        last_name: response.data.profile.last_name || "",
        phone_number: response.data.profile.phone_number || "",
        address: response.data.profile.address || "",
        department: response.data.profile.department || "",
        subjects: response.data.profile.subjects || [],
      });
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put("/users/update-profile/", formData);
      toast.success("Profile updated successfully");
      setEditMode(false);
      fetchProfile(); // Refresh profile data
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5dff]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-500 p-6 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Profile Information</h1>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition">
                <HiPencil className="w-5 h-5" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition">
                  <HiCheck className="w-5 h-5" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      first_name: profile.profile.first_name || "",
                      last_name: profile.profile.last_name || "",
                      phone_number: profile.profile.phone_number || "",
                      address: profile.profile.address || "",
                      department: profile.profile.department || "",
                      subjects: profile.profile.subjects || [],
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition">
                  <HiX className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Basic Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={profile.username}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 rounded-lg text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 rounded-lg text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 rounded-lg ${
                    editMode
                      ? "border border-gray-300 focus:ring-2 focus:ring-[#8b5dff] focus:border-transparent"
                      : "bg-gray-100 text-gray-600"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 rounded-lg ${
                    editMode
                      ? "border border-gray-300 focus:ring-2 focus:ring-[#8b5dff] focus:border-transparent"
                      : "bg-gray-100 text-gray-600"
                  }`}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Contact Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 rounded-lg ${
                    editMode
                      ? "border border-gray-300 focus:ring-2 focus:ring-[#8b5dff] focus:border-transparent"
                      : "bg-gray-100 text-gray-600"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  rows="3"
                  className={`w-full px-3 py-2 rounded-lg ${
                    editMode
                      ? "border border-gray-300 focus:ring-2 focus:ring-[#8b5dff] focus:border-transparent"
                      : "bg-gray-100 text-gray-600"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 rounded-lg ${
                    editMode
                      ? "border border-gray-300 focus:ring-2 focus:ring-[#8b5dff] focus:border-transparent"
                      : "bg-gray-100 text-gray-600"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subjects
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.subjects.map((subject, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
