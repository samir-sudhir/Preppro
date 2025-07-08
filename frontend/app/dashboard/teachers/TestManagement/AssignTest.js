"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../../../api";

const AssignTest = () => {
  const [tests, setTests] = useState([]);
  const [assignmentData, setAssignmentData] = useState({
    testId: "",
    assignTo: "class", // 'class' or 'individual'
    selectedClass: "",
    selectedStudents: [],
    startDateTime: new Date(),
    endDateTime: new Date(),
    endDate: "",
    endTime: "",
    allowMultipleAttempts: false,
    maxAttempts: 1,
    showResults: "immediately", // 'immediately', 'after_end', 'never'
    passingCriteria: 40,
    instructions: "",
  });

  const [availableTests, setAvailableTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({
    class: "",
    section: "",
  });
  const [sections, setSections] = useState([]); // Add this line
  const filteredStudents = students.filter((student) => {
    // Ensure the student has a profile
    if (!student.profile) return false;

    // Apply class and section filters
    const matchesClass =
      !filters.class || student.profile.class === filters.class;
    const matchesSection =
      !filters.section || student.profile.section === filters.section;

    return matchesClass && matchesSection;
  });

  useEffect(() => {
    api
      .get("/tests/")
      .then((response) => {
        console.log("Fetched tests:", response.data); // Debugging
        setTests(response.data); // Populate the tests state with the fetched data
      })
      .catch((error) => {
        console.error("Error fetching tests:", error);
      });
  }, []);

  // Fetch students
  useEffect(() => {
    api
      .get("/users/students/")
      .then((response) => setStudents(response.data))
      .catch((error) => console.error("Error fetching students:", error));
  }, []); // <-- missing previously

  useEffect(() => {
    api
      .get("/users/students/filter/")
      .then((response) => {
        setClasses(response.data.classes || []);
        setSections(response.data.sections || []); // maybe initial sections
      })
      .catch((error) =>
        console.error("Error fetching classes and sections:", error)
      );
  }, []);

  useEffect(() => {
    if (filters.class) {
      api
        .get("/users/students/filter/", {
          params: { class: filters.class },
        })
        .then((response) => {
          setSections(response.data.sections || []);
        })
        .catch((error) => console.error("Error fetching sections:", error));
    } else {
      // If no class is selected, you might want to clear sections
      setSections([]);
    }
  }, [filters.class]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted"); // Debugging

    try {
      // Collect student IDs based on assignment type
      let assignedTo = [];

      if (assignmentData.assignTo === "class") {
        // Get all student IDs from the selected class
        assignedTo = students
          .filter(
            (student) =>
              student.profile && student.profile.class === filters.class
          )
          .map((student) => student.id);
        if (assignedTo.length === 0) {
          toast.error("Selected class has no students for assignment.");
          return;
        }
      } else if (assignmentData.assignTo === "individual") {
        // Use selected student IDs
        assignedTo = assignmentData.selectedStudents;
      }

      if (assignedTo.length === 0) {
        toast.error("No students selected for assignment.");
        return;
      }
      const startDate = `${assignmentData.startDate}T${assignmentData.startTime}:00Z`;
      const endDate = `${assignmentData.endDate}T${assignmentData.endTime}:00Z`;

      if (!startDate || !endDate) {
        toast.error("Start and end dates are required.");
        return;
      }

      // Prepare the request payload
      const payload = {
        test: assignmentData.testId,
        assigned_to: assignedTo,
        start_date: assignmentData.startDateTime.toISOString(),
        end_date: assignmentData.endDateTime.toISOString(),
        allow_multiple_attempts: assignmentData.allowMultipleAttempts,
        show_results: assignmentData.showResults,
        passing_criteria: assignmentData.passingCriteria,
        additional_instructions: assignmentData.instructions || null,
      };

      console.log("Assigned to", assignedTo);

      console.log("Payload:", payload); // Debugging

      // Send the API request
      const response = await api.post("/tests/assign/", payload);
      console.log("API Response:", response.data); // Debugging

      // Handle success
      toast.success("Test assigned successfully!");
    } catch (error) {
      // Handle errors
      console.error("Error assigning test:", error);
      toast.error("Failed to assign test. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Assign Test</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Test Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Test
          </label>
          <Select
            options={tests.map((test) => ({
              value: test.id,
              label: test.title,
            }))}
            onChange={(selectedOption) =>
              setAssignmentData({
                ...assignmentData,
                testId: selectedOption.value,
              })
            }
            placeholder="Select a test"
            className="react-select-container"
            classNamePrefix="react-select"
            required
          />
        </div>

        {/* Assignment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign To
          </label>
          <div className="flex gap-4">
            {["class", "individual"].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  value={type}
                  checked={assignmentData.assignTo === type}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      assignTo: e.target.value,
                    })
                  }
                  className="mr-2"
                />
                {type === "class" ? "Entire Class" : "Individual Students"}
              </label>
            ))}
          </div>
        </div>

        {/* Class or Students Selection */}
        {assignmentData.assignTo === "class" ? (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={filters.class}
              onChange={
                (e) =>
                  setFilters({ ...filters, class: e.target.value, section: "" }) // Reset section on class change
              }
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="" selected disabled>
                Select a class
              </option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Class
                </label>
                <select
                  value={filters.class}
                  onChange={
                    (e) =>
                      setFilters({
                        ...filters,
                        class: e.target.value,
                        section: "",
                      }) // Reset section when class changes
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Section
                </label>
                <select
                  value={filters.section}
                  onChange={(e) =>
                    setFilters({ ...filters, section: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">All Sections</option>
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Students Multi-select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Students
              </label>
              <Select
                isMulti
                options={filteredStudents.map((student) => ({
                  value: student.id,
                  label: `${
                    student.profile
                      ? `${student.profile.first_name || ""} ${
                          student.profile.last_name || ""
                        }`
                      : student.username
                  } (${student.profile?.class || "No Class"}) - Section ${
                    student.profile?.section || "N/A"
                  }`,
                }))}
                value={filteredStudents
                  .filter((s) => assignmentData.selectedStudents.includes(s.id))
                  .map((s) => ({
                    value: s.id,
                    label: `${
                      s.profile
                        ? `${s.profile.first_name || ""} ${
                            s.profile.last_name || ""
                          }`
                        : s.username
                    } (${s.profile?.class || "No Class"}) - Section ${
                      s.profile?.section || "N/A"
                    }`,
                  }))}
                onChange={(selectedOptions) => {
                  setAssignmentData({
                    ...assignmentData,
                    selectedStudents: selectedOptions.map(
                      (option) => option.value
                    ),
                  });
                }}
                placeholder="Search and select students..."
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          </div>
        )}

        {/* Scheduling */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-0">
          {/* Start Date & Time */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date & Time
            </label>
            <DatePicker
              selected={assignmentData.startDateTime}
              onChange={(date) =>
                setAssignmentData({ ...assignmentData, startDateTime: date })
              }
              showTimeSelect
              dateFormat="Pp"
              timeIntervals={15}
              placeholderText="Select date & time"
              className="w-full p-3 border mx-2 border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              calendarClassName="!bg-white !border !rounded-xl !shadow-lg "
              dayClassName={(date) =>
                "hover:bg-blue-100 rounded-full transition-colors duration-150 ease-in-out"
              }
            />
          </div>

          {/* End Date & Time */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date & Time
            </label>
            <DatePicker
              selected={assignmentData.endDateTime}
              onChange={(date) =>
                setAssignmentData({ ...assignmentData, endDateTime: date })
              }
              showTimeSelect
              dateFormat="Pp"
              timeIntervals={15}
              placeholderText="Select date & time"
              className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              calendarClassName="!bg-white !border !rounded-xl !shadow-lg"
              dayClassName={(date) =>
                "hover:bg-blue-100 rounded-full transition-colors duration-150 ease-in-out"
              }
            />
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={assignmentData.allowMultipleAttempts}
              onChange={(e) =>
                setAssignmentData({
                  ...assignmentData,
                  allowMultipleAttempts: e.target.checked,
                  maxAttempts: e.target.checked
                    ? assignmentData.maxAttempts
                    : 1,
                })
              }
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">
              Allow Multiple Attempts
            </label>
          </div>

          {assignmentData.allowMultipleAttempts && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Attempts
              </label>
              <input
                type="number"
                min="1"
                value={assignmentData.maxAttempts}
                onChange={(e) =>
                  setAssignmentData({
                    ...assignmentData,
                    maxAttempts: parseInt(e.target.value),
                  })
                }
                className="w-32 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Show Results
            </label>
            <select
              value={assignmentData.showResults}
              onChange={(e) =>
                setAssignmentData({
                  ...assignmentData,
                  showResults: e.target.value,
                })
              }
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="immediately">Immediately after submission</option>
              <option value="after_submission">After test end date</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passing Criteria (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={assignmentData.passingCriteria}
              onChange={(e) =>
                setAssignmentData({
                  ...assignmentData,
                  passingCriteria: parseInt(e.target.value),
                })
              }
              className="w-32 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Instructions (Optional)
          </label>
          <textarea
            value={assignmentData.instructions}
            onChange={(e) =>
              setAssignmentData({
                ...assignmentData,
                instructions: e.target.value,
              })
            }
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows="3"
            placeholder="Enter any additional instructions for students..."
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() =>
              setAssignmentData({
                testId: "",
                assignTo: "class",
                selectedClass: "",
                selectedStudents: [],
                startDate: "",
                startTime: "",
                endDate: "",
                endTime: "",
                allowMultipleAttempts: false,
                maxAttempts: 1,
                showResults: "immediately",
                passingCriteria: 40,
                instructions: "",
              })
            }
            className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Clear
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[#8b5dff] text-white rounded-lg hover:bg-[#7a4bc4]">
            Assign Test
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignTest;
