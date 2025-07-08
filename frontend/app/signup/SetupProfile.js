"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "../../api";
import toast from "react-hot-toast";
import { Loader, ArrowLeft } from "lucide-react";

export default function SetupProfile() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
    department: "",
    subjects: [],
    bio: "",
    student_class: "",
    section: "",
  });

  useEffect(() => {
    // Check if user is authenticated and has a role
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (!token) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    try {
      const user = userData ? JSON.parse(userData) : null;
      if (!user || !user.role) {
        toast.error("User data not found. Please login again.");
        router.push("/login");
        return;
      }

      setUserRole(user.role);
      // Set the token in the API headers
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      console.error("Error parsing user data:", error);
      toast.error("Invalid user data. Please login again.");
      router.push("/login");
    }
  }, [router]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = [];

    // Common required fields
    if (!formData.first_name) errors.push("First name is required");
    if (!formData.last_name) errors.push("Last name is required");
    if (!formData.phone_number) errors.push("Phone number is required");
    if (!formData.address) errors.push("Address is required");

    // Role-specific required fields
    if (userRole === "student") {
      if (!formData.student_class) errors.push("Class is required");
      if (!formData.section) errors.push("Section is required");
    } else if (userRole === "teacher") {
      if (!formData.department) errors.push("Department is required");
      if (!formData.subjects.length)
        errors.push("At least one subject is required");
    }

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        if (key === "subjects") {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Append image if selected
      if (profileImage) {
        submitData.append("profile_photo", profileImage);
      }

      const response = await api.post("/users/profile-setup/", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        toast.success("Profile setup completed successfully");
        // Redirect based on user role
        if (userRole === "student") {
          router.push("/dashboard/students");
        } else if (userRole === "teacher") {
          router.push("/dashboard/teachers");
        }
      }
    } catch (error) {
      if (error.response?.data) {
        const errors = error.response.data;
        if (errors.detail === "Authentication credentials were not provided.") {
          toast.error("Session expired. Please login again.");
          router.push("/login");
          return;
        }
        Object.keys(errors).forEach((key) => {
          toast.error(errors[key][0]);
        });
      } else {
        toast.error("Failed to setup profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Complete Your Profile
          </h2>

          {/* Profile Image Upload */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 mb-4">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Profile Preview"
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="profile-image"
            />
            <label
              htmlFor="profile-image"
              className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
              Upload Photo
            </label>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="2"
                required
              />
            </div>
          </div>

          {/* Role-specific fields */}
          {userRole === "student" && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="student_class"
                  value={formData.student_class}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          {userRole === "teacher" && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subjects <span className="text-red-500">*</span>
                </label>
                <select
                  multiple
                  name="subjects"
                  value={formData.subjects}
                  onChange={(e) => {
                    const values = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );
                    setFormData((prev) => ({ ...prev, subjects: values }));
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required>
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="biology">Biology</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hold Ctrl (Windows) or Command (Mac) to select multiple
                  subjects
                </p>
              </div>
            </div>
          )}

          {/* Bio */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="3"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Complete Setup"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
