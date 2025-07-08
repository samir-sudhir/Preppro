"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/api"; // Axios instance with token
import { Loader, Pencil, Save, X, Camera, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
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
    // Check if user is authenticated
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (!token || !userData) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    // Set the token in the API headers
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    async function fetchProfile() {
      try {
        const res = await api.get("/users/profile/");
        setProfileData(res.data);
        setFormData({
          first_name: res.data.profile.first_name || "",
          last_name: res.data.profile.last_name || "",
          phone_number: res.data.profile.phone_number || "",
          address: res.data.profile.address || "",
          department: res.data.profile.department || "",
          subjects: res.data.profile.subjects || [],
          bio: res.data.profile.bio || "",
          student_class: res.data.profile.student_class || "",
          section: res.data.profile.section || "",
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
        if (error.response?.status === 404) {
          // Profile not found, redirect to setup profile page
          toast.error("Please complete your profile setup first");
          router.push("/signup/setup-profile");
        } else {
          toast.error("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e) => {
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

    setSelectedImage(file);
    // Create a preview URL for the selected image
    const previewUrl = URL.createObjectURL(file);
    setProfileData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        profile_photo: previewUrl,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.first_name || !formData.last_name) {
      toast.error("First name and last name are required");
      return;
    }

    setUploading(true);
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
      if (selectedImage) {
        submitData.append("profile_photo", selectedImage);
      }

      await api.put("/users/update-profile/", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile updated successfully");
      setEditMode(false);
      setSelectedImage(null);

      // Refresh profile data
      const res = await api.get("/users/profile/");
      setProfileData(res.data);
    } catch (error) {
      if (error.response?.data) {
        // Handle validation errors
        const errors = error.response.data;
        Object.keys(errors).forEach((key) => {
          toast.error(errors[key][0]);
        });
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleBackToDashboard = () => {
    const userRole = profileData?.role;
    if (userRole === "teacher") {
      router.push("/dashboard/teachers");
    } else {
      router.push("/dashboard/students");
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setSelectedImage(null);
    setFormData({
      first_name: profileData.profile.first_name || "",
      last_name: profileData.profile.last_name || "",
      phone_number: profileData.profile.phone_number || "",
      address: profileData.profile.address || "",
      department: profileData.profile.department || "",
      subjects: profileData.profile.subjects || [],
      bio: profileData.profile.bio || "",
      student_class: profileData.profile.student_class || "",
      section: profileData.profile.section || "",
    });
    // Reset profile photo preview
    setProfileData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        profile_photo: profileData.profile.profile_photo,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (!profileData) {
    return null; // Will redirect to setup profile page
  }

  const { username, email, role, profile } = profileData;

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-500 p-6">
            <div className="flex flex-col items-center">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-28 h-28 rounded-full bg-white p-1 shadow-lg overflow-hidden ring-4 ring-white/20">
                  {profile?.profile_photo ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={profile.profile_photo}
                        alt="Profile"
                        fill
                        className="object-cover rounded-full"
                        sizes="(max-width: 112px) 100vw, 112px"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-3xl text-white">
                        {username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {editMode && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition opacity-0 group-hover:opacity-100">
                    <Camera className="w-4 h-4 text-purple-600" />
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <Loader className="animate-spin h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              <h1 className="mt-3 text-xl font-bold text-white">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-white/90 text-sm">{email}</p>
              <div className="mt-1 px-3 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </div>
            </div>

            {/* Edit Button */}
            <div className="absolute top-4 right-4">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition text-white text-sm">
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    disabled={uploading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    <Save className="w-3.5 h-3.5" />
                    {uploading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={uploading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    <X className="w-3.5 h-3.5" />
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
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-gradient-to-b from-purple-400 to-indigo-500 rounded-full"></span>
                  Basic Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    disabled
                    className="w-full px-3 py-1.5 bg-gray-50 rounded-lg text-gray-600 border border-gray-200 text-sm"
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
                    className={`w-full px-3 py-1.5 rounded-lg text-sm ${
                      editMode
                        ? "border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                        : "bg-gray-50 text-gray-600 border border-gray-200"
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
                    className={`w-full px-3 py-1.5 rounded-lg text-sm ${
                      editMode
                        ? "border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                        : "bg-gray-50 text-gray-600 border border-gray-200"
                    }`}
                  />
                </div>

                {role === "student" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class
                      </label>
                      <input
                        type="text"
                        value={profile.class || profile.student_class || "N/A"}
                        disabled
                        className="w-full px-3 py-1.5 bg-gray-50 rounded-lg text-gray-600 border border-gray-200 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section
                      </label>
                      <input
                        type="text"
                        value={profile.section || "N/A"}
                        disabled
                        className="w-full px-3 py-1.5 bg-gray-50 rounded-lg text-gray-600 border border-gray-200 text-sm focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-gradient-to-b from-purple-400 to-indigo-500 rounded-full"></span>
                  Contact Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-3 py-1.5 bg-gray-50 rounded-lg text-gray-600 border border-gray-200 text-sm focus:outline-none"
                  />
                </div>

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
                    className={`w-full px-3 py-1.5 rounded-lg text-sm ${
                      editMode
                        ? "border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                        : "bg-gray-50 text-gray-600 border border-gray-200"
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
                    rows="2"
                    className={`w-full px-3 py-1.5 rounded-lg text-sm ${
                      editMode
                        ? "border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                        : "bg-gray-50 text-gray-600 border border-gray-200"
                    }`}
                  />
                </div>

                {role === "teacher" && (
                  <>
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
                        className={`w-full px-3 py-1.5 rounded-lg text-sm ${
                          editMode
                            ? "border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                            : "bg-gray-50 text-gray-600 border border-gray-200"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subjects
                      </label>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {(profile.subjects || []).map((subject, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    rows="2"
                    className={`w-full px-3 py-1.5 rounded-lg text-sm ${
                      editMode
                        ? "border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                        : "bg-gray-50 text-gray-600 border border-gray-200"
                    }`}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
