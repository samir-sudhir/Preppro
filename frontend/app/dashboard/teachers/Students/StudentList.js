"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaTrash, FaTimes } from "react-icons/fa";
import Image from "next/image";
import api from "../../../../api";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Unauthorized: No token found.");

      const response = await api.get("/users/fetch/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const studentData = response.data.filter(
        (user) => user.role === "student"
      );
      setStudents(studentData);
    } catch (err) {
      toast.error("Failed to fetch students.");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (studentId) => {
    try {
      setLoading(true);
      const response = await api.get(`/users/students/${studentId}/profile/`);
      setSelectedStudent(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error(
        error.response?.data?.error || "Failed to fetch student details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;

    try {
      setLoading(true);
      await api.delete("/users/delete-user/", {
        data: { user_id: studentToDelete.id },
      });
      toast.success("Student deleted successfully");
      // Refresh the student list
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error(error.response?.data?.error || "Failed to delete student");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.profile && // Ensure profile exists
      (`${student.profile.first_name || ""} ${student.profile.last_name || ""}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Student Details Modal
  const StudentDetailsModal = () => {
    if (!selectedStudent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Student Details
            </h2>
            <button
              onClick={() => setSelectedStudent(null)}
              className="text-gray-500 hover:text-gray-700">
              <FaTimes size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Profile Photo */}
            <div className="flex justify-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                {selectedStudent.profile?.profile_photo ? (
                  <Image
                    src={selectedStudent.profile.profile_photo}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FaTimes size={48} />
                  </div>
                )}
              </div>
            </div>

            {/* Student Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="mt-1 text-gray-900">
                  {selectedStudent.profile?.first_name}{" "}
                  {selectedStudent.profile?.last_name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-gray-900">{selectedStudent.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <p className="mt-1 text-gray-900">
                  {selectedStudent.profile?.phone_number}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Class
                </label>
                <p className="mt-1 text-gray-900">
                  {selectedStudent.profile?.student_class}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Section
                </label>
                <p className="mt-1 text-gray-900">
                  {selectedStudent.profile?.section}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <p className="mt-1 text-gray-900">
                  {selectedStudent.profile?.address}
                </p>
              </div>
            </div>

            {/* Bio */}
            {selectedStudent.profile?.bio && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <p className="mt-1 text-gray-900">
                  {selectedStudent.profile.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Dialog
  const DeleteConfirmationDialog = () => {
    if (!showDeleteConfirm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Confirm Deletion
          </h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete{" "}
            {studentToDelete?.profile?.first_name}'s account? This action cannot
            be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setStudentToDelete(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={loadingAction}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
              {loadingAction ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="pl" width="120" height="120" viewBox="0 0 240 240">
          <circle
            className="pl__ring pl__ring--a"
            cx="120"
            cy="120"
            r="105"
            fill="none"
            stroke="#000"
            strokeWidth="20"
            strokeDasharray="0 660"
            strokeDashoffset="-330"
            strokeLinecap="round"
          />
          <circle
            className="pl__ring pl__ring--b"
            cx="120"
            cy="120"
            r="35"
            fill="none"
            stroke="#000"
            strokeWidth="20"
            strokeDasharray="0 220"
            strokeDashoffset="-110"
            strokeLinecap="round"
          />
          <circle
            className="pl__ring pl__ring--c"
            cx="85"
            cy="120"
            r="70"
            fill="none"
            stroke="#000"
            strokeWidth="20"
            strokeDasharray="0 440"
            strokeLinecap="round"
          />
          <circle
            className="pl__ring pl__ring--d"
            cx="155"
            cy="120"
            r="70"
            fill="none"
            stroke="#000"
            strokeWidth="20"
            strokeDasharray="0 440"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Registered Students
          </h2>
        </div>

        <input
          type="text"
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {student.profile.first_name} {student.profile.last_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.profile.phone_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.profile.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleViewProfile(student.id)}
                    className="text-blue-600 hover:text-blue-900">
                    View Profile
                  </button>
                  <button
                    onClick={() => handleDeleteClick(student)}
                    className="text-red-500 hover:text-red-700 mx-2">
                    <FaTrash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <StudentDetailsModal />
      <DeleteConfirmationDialog />
    </div>
  );
};

export default StudentList;
