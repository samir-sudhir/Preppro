import { Dialog } from "@headlessui/react";
import { FiX } from "react-icons/fi";

const TestPreviewModal = ({ isOpen, onClose, test, questions }) => {
  if (!test) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <Dialog.Panel className="bg-white rounded-xl shadow-xl p-6 max-w-3xl w-full relative max-h-[90vh] overflow-y-auto custom-scroll">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl">
          <FiX />
        </button>

        {/* Header */}
        <Dialog.Title className="text-2xl font-bold text-gray-800 mb-1">
          {test.title}
        </Dialog.Title>
        <p className="text-gray-600 mb-4 mt-6">{test.description}</p>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
          <p>
            <strong>Duration:</strong> {test.duration} mins
          </p>
          <p>
            <strong>Total Marks:</strong> {test.total_marks}
          </p>
          <p>
            <strong>Passing Marks:</strong> {test.passing_marks}
          </p>
          <p>
            <strong>Subject:</strong> {test.subject}
          </p>
          <p>
            <strong>Topic:</strong> {test.topic}
          </p>
          <p>
            <strong>Difficulty:</strong> {test.difficulty}
          </p>
        </div>

        {/* Questions */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Questions:</h3>
          <ul className="space-y-4">
            {questions.map((q, index) => (
              <li key={index} className="p-4 border rounded-lg bg-[#a4d2ec3b]">
                <p className="mb-2">
                  <strong>Q{index + 1}:</strong> {q.question_text}
                </p>
                <ul className="list-disc list-inside ml-4 text-sm text-gray-700 space-y-1">
                  {q.options?.map((opt, i) => (
                    <li
                      key={i}
                      className={
                        q.correct_answer === opt
                          ? "text-green-600 font-medium"
                          : ""
                      }>
                      {opt}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default TestPreviewModal;
