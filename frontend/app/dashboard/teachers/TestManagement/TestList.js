import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { toast } from "react-hot-toast";
import { FiEye, FiEdit, FiTrash2, FiUpload } from "react-icons/fi";
import api from "../../../../api";
import EditTest from "./EditTest";
import TestPreviewModal from "./TestPreviewModal";

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTestId, setDeleteTestId] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [testQuestions, setTestQuestions] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [questionSearchQuery, setQuestionSearchQuery] = useState("");
  const [publishConfirmId, setPublishConfirmId] = useState(null);

  const getToken = async () => {
    let token = null;
    for (let i = 0; i < 10; i++) {
      token = localStorage.getItem("authToken");
      if (token) break;
      await new Promise((res) => setTimeout(res, 100));
    }
    return token;
  };

  const loadTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await api.get("/tests/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTests(response.data);
    } catch (error) {
      setError("Failed to fetch tests.");
      toast.error("Failed to fetch tests.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTestQuestions = async (testId) => {
    try {
      const token = await getToken();
      const res = await api.get(`/tests/${testId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTestQuestions(res.data.test_questions || []);
    } catch (err) {
      toast.error("Failed to load questions.");
    }
  };

  const fetchAvailableQuestions = async () => {
    try {
      const token = await getToken();
      const res = await api.get("/questions/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allQuestions = res.data.data;
      console.log("All questions:", allQuestions);

      const includedQuestionIds = editForm.test_questions || [];
      const filteredQuestions = allQuestions.filter(
        (q) => !includedQuestionIds.includes(q.id)
      );

      setAvailableQuestions(filteredQuestions);
    } catch (err) {
      toast.error("Failed to load available questions.");
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const confirmDeleteTest = (testId) => {
    setDeleteTestId(testId);
  };

  const handleDeleteTest = async () => {
    if (!deleteTestId) return;
    try {
      const token = await getToken();
      await api.delete(`/tests/${deleteTestId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTests(tests.filter((t) => t.id !== deleteTestId));
      toast.success("Test deleted!");
    } catch {
      toast.error("Failed to delete test.");
    } finally {
      setDeleteTestId(null);
    }
  };
  const handlePublishResult = async () => {
    if (!publishConfirmId) return;
    try {
      const token = await getToken();
      await api.post(
        `/tests/${publishConfirmId}/publish/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Test results published successfully!");
      setTests((prevTests) =>
        prevTests.map((test) =>
          test.id === publishConfirmId ? { ...test, is_published: true } : test
        )
      );
    } catch (error) {
      toast.error("Failed to publish test results.");
    } finally {
      setPublishConfirmId(null);
    }
  };

  const openPreview = async (test) => {
    setSelectedTest(test);
    await fetchTestQuestions(test.id);
    setIsPreviewOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const openEdit = async (test) => {
    setSelectedTest(test);
    await fetchTestQuestions(test.id);
    setEditForm({
      title: test.title || "",
      description: test.description || "",
      duration: test.duration || "",
      total_marks: test.total_marks || "",
      passing_marks: test.passing_marks || "",
      subject: test.subject || "",
      topic: test.topic || "",
      difficulty: test.difficulty || "",
      instructions: test.instructions || "",
      test_questions: (testQuestions || []).map((q) => q.question), // Initialize as array of question IDs
    });
    await fetchAvailableQuestions();
    setIsEditOpen(true);
  };

  const handleAddQuestion = (question) => {
    setEditForm((prev) => ({
      ...prev,
      test_questions: [...(prev.test_questions || []), question.id],
    }));
    setAvailableQuestions((prev) => prev.filter((q) => q.id !== question.id));
  };

  const handleRemoveQuestion = (questionIdToRemove) => {
    setEditForm((prev) => ({
      ...prev,
      test_questions: (prev.test_questions || []).filter(
        (id) => id !== questionIdToRemove
      ),
    }));
    // Add the removed question back to the available questions list
    const removedQuestion = testQuestions.find(
      (q) => q.question === questionIdToRemove
    );
    if (removedQuestion) {
      setAvailableQuestions((prev) => [
        ...prev,
        {
          id: removedQuestion.question,
          question: removedQuestion.question_text,
        },
      ]);
    }
  };

  const handleUpdateTest = async () => {
    const requiredFields = [
      "title",
      "description",
      "duration",
      "total_marks",
      "passing_marks",
      "subject",
      "topic",
      "difficulty",
      "instructions",
    ];
    const missingFields = requiredFields.filter((field) => !editForm[field]);
    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const token = await getToken();
      const requestBody = {
        title: editForm.title,
        description: editForm.description,
        duration: editForm.duration,
        total_marks: editForm.total_marks,
        passing_marks: editForm.passing_marks,
        subject: editForm.subject,
        topic: editForm.topic,
        difficulty: editForm.difficulty,
        instructions: editForm.instructions,
        test_questions:
          editForm.test_questions?.map((questionId) => ({
            question: questionId,
          })) || [],
      };

      const response = await api.put(
        `/tests/${selectedTest.id}/`,
        requestBody,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTests(
        tests.map((test) =>
          test.id === selectedTest.id ? { ...test, ...response.data } : test
        )
      );

      toast.success("Test updated successfully!");
      setIsEditOpen(false);
    } catch (err) {
      if (err.response && err.response.data) {
        const errors = err.response.data;
        Object.keys(errors).forEach((field) => {
          const errorMessage = Array.isArray(errors[field])
            ? errors[field].join(", ")
            : errors[field];
          toast.error(`${field}: ${errorMessage}`);
        });
      } else {
        toast.error("Failed to update test.");
      }
    }
  };

  const filteredTests = tests.filter((test) =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailableQuestions = availableQuestions.filter((q) =>
    q.question.toLowerCase().includes(questionSearchQuery.toLowerCase())
  );

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
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Test Management</h2>
        <input
          type="text"
          placeholder="Search tests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-72 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Subject</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Result Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTests.map((test) => (
              <tr key={test.id}>
                <td className="px-6 py-4">{test.title}</td>
                <td className="px-6 py-4">{test.subject}</td>
                <td className="px-6 py-4">
                  {new Date(test.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {test.is_published ? "Published" : "Not Published"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3 text-lg">
                    <FiEye
                      title="Preview Test"
                      className="text-blue-600 cursor-pointer"
                      onClick={() => openPreview(test)}
                    />
                    <FiEdit
                      title="Edit Test"
                      className="text-yellow-500 cursor-pointer"
                      onClick={() => openEdit(test)}
                    />
                    <FiTrash2
                      title="Delete Test"
                      className="text-red-600 cursor-pointer"
                      onClick={() => confirmDeleteTest(test.id)}
                    />
                    {!test.is_published && (
                      <FiUpload
                        title="Publish Results"
                        onClick={() => setPublishConfirmId(test.id)}
                        className="text-green-600 cursor-pointer"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      <Dialog
        open={!!deleteTestId}
        onClose={() => setDeleteTestId(null)}
        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-lg font-semibold">Delete Test</h2>
          <p className="text-sm text-gray-600 mt-2">
            Are you sure you want to delete this test?
          </p>
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => setDeleteTestId(null)}
              className="text-gray-600 hover:text-black">
              Cancel
            </button>
            <button
              onClick={handleDeleteTest}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Delete
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* Preview Modal */}
      <TestPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        test={selectedTest}
        questions={testQuestions}
      />

      {/* Edit Modal */}
      <EditTest
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        editForm={editForm}
        testQuestions={testQuestions}
        availableQuestions={availableQuestions}
        questionSearchQuery={questionSearchQuery}
        onFieldChange={handleEditChange}
        onUpdate={handleUpdateTest}
        onAddQuestion={handleAddQuestion}
        onRemoveQuestion={handleRemoveQuestion} // Pass the new remove function
        onSearchQueryChange={(e) => setQuestionSearchQuery(e.target.value)}
      />
      {/*Publish confirmation dialogue box */}
      <Dialog
        open={!!publishConfirmId}
        onClose={() => setPublishConfirmId(null)}
        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-lg font-semibold">Publish Result</h2>
          <p className="text-sm text-gray-600 mt-2">
            Are you sure you want to publish the results for this test? This
            action cannot be undone.
          </p>
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => setPublishConfirmId(null)}
              className="text-gray-600 hover:text-black">
              Cancel
            </button>
            <button
              onClick={handlePublishResult}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Publish
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
};

export default TestList;
