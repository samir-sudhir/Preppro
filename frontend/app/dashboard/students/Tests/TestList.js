"use client";
import { useState } from 'react';

const TestList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Sample data - will be fetched from API
  const tests = [
    {
      id: 1,
      title: "Physics Mid-Term",
      subject: "Physics",
      duration: 60,
      totalQuestions: 30,
      dueDate: "2024-03-20",
      teacher: "Dr. Smith",
      status: "not_started",
      description: "Covers chapters 1-5: Mechanics, Waves, and Thermodynamics"
    },
    {
      id: 2,
      title: "Chemistry Quiz",
      subject: "Chemistry",
      duration: 30,
      totalQuestions: 15,
      dueDate: "2024-03-18",
      teacher: "Mrs. Johnson",
      status: "in_progress",
      description: "Periodic Table and Chemical Bonding"
    },
    {
      id: 3,
      title: "Mathematics Test",
      subject: "Mathematics",
      duration: 45,
      totalQuestions: 25,
      dueDate: "2024-03-21",
      teacher: "Mr. Brown",
      status: "not_started",
      description: "Algebra and Calculus fundamentals"
    }
  ];

  const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
  const statuses = ['not_started', 'in_progress', 'completed'];

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || test.subject === selectedSubject;
    const matchesStatus = selectedStatus === 'all' || test.status === selectedStatus;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'not_started':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    return status.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Available Tests</h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{getStatusText(status)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Test Cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredTests.map((test) => (
          <div key={test.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{test.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{test.subject} • {test.teacher}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(test.status)}`}>
                  {getStatusText(test.status)}
                </span>
              </div>

              <p className="text-gray-600 mb-4">{test.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{test.duration} mins</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Questions</p>
                  <p className="font-medium">{test.totalQuestions}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-medium">{new Date(test.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time Left</p>
                  <p className="font-medium text-red-600">2 days</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t pt-4">
                <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                  View Details
                </button>
                {test.status === 'not_started' && (
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    Start Test
                  </button>
                )}
                {test.status === 'in_progress' && (
                  <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                    Continue Test
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestList; 