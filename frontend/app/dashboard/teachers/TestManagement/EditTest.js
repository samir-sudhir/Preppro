import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import { useState, useEffect } from "react";

const EditTestModal = ({
  isOpen,
  onClose,
  editForm,
  testQuestions,
  availableQuestions,
  questionSearchQuery,
  onFieldChange,
  onUpdate,
  onAddQuestion,
  onRemoveQuestion,
  onSearchQueryChange,
}) => {
  const filteredAvailableQuestions = availableQuestions.filter((q) =>
    q.question.toLowerCase().includes(questionSearchQuery.toLowerCase())
  );

  const [currentIncludedQuestions, setCurrentIncludedQuestions] = useState([
    ...testQuestions,
  ]);

  useEffect(() => {
    setCurrentIncludedQuestions([...testQuestions]);
  }, [testQuestions]);

  const handleAddAndPreview = (question) => {
    onAddQuestion(question);
    setCurrentIncludedQuestions((prev) => [
      ...prev,
      { question_text: question.question, id: question.id },
    ]);
  };

  const handleRemoveAndPreview = (questionId) => {
    onRemoveQuestion(questionId);
    setCurrentIncludedQuestions((prev) =>
      prev.filter((q) => q.id !== questionId)
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 overflow-y-auto">
          {" "}
          {/* Added overflow-y-auto here */}
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold text-gray-800">
              Edit Test Details
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none ">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { label: "Title", name: "title", type: "text" },
              { label: "Subject", name: "subject", type: "text" },
              { label: "Duration (minutes)", name: "duration", type: "number" },
              { label: "Total Marks", name: "total_marks", type: "number" },
              { label: "Passing Marks", name: "passing_marks", type: "number" },
              { label: "Topic", name: "topic", type: "text" },
              { label: "Difficulty", name: "difficulty", type: "text" },
              { label: "Instructions", name: "instructions", type: "textarea" },
            ].map((field) => (
              <div key={field.name} className="mb-3">
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700 capitalize">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={editForm[field.name] || ""}
                    onChange={onFieldChange}
                    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={editForm[field.name] || ""}
                    onChange={onFieldChange}
                    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Included Questions Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Included Questions
              </h3>
              <ul className="max-h-[50vh] overflow-y-auto divide-y divide-gray-200 rounded-md border">
                {currentIncludedQuestions.map((q, index) => (
                  <li
                    key={index}
                    className="px-4 py-3 flex items-center justify-between">
                    <p className="text-gray-700 text-sm">{q.question_text}</p>
                    <FiTrash2
                      className="text-red-600 cursor-pointer"
                      onClick={() => handleRemoveAndPreview(q.id)}
                    />
                  </li>
                ))}
                {currentIncludedQuestions.length === 0 && (
                  <li className="px-4 py-3 text-gray-500 text-sm">
                    No questions included yet.
                  </li>
                )}
              </ul>
            </div>

            {/* Add More Questions Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Add More Questions
              </h3>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={questionSearchQuery}
                  onChange={onSearchQueryChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm focus:outline-none"
                />
              </div>
              <ul className="max-h-[40vh] overflow-y-auto divide-y divide-gray-200 rounded-md border">
                {filteredAvailableQuestions.map((q) => (
                  <li
                    key={q.id}
                    className="px-4 py-3 flex items-center justify-between">
                    <p className="text-gray-700 text-sm">{q.question}</p>
                    <button
                      onClick={() => handleAddAndPreview(q)}
                      className="ml-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md focus:outline-none focus:ring-green-500 sm:text-sm">
                      Add
                    </button>
                  </li>
                ))}
                {filteredAvailableQuestions.length === 0 && (
                  <li className="px-4 py-3 text-gray-500 text-sm">
                    No matching questions found.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm">
            Cancel
          </button>
          <button
            onClick={onUpdate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm">
            Update
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default EditTestModal;
