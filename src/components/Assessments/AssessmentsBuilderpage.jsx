import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  PlusCircle,
  Type,
  CheckSquare,
  Trash2,
  ArrowLeft,
  ChevronDown,
  GripVertical,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../services/database"; // Corrected path

// --- Helper to generate unique IDs ---
const generateId = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// --- Toast Notification Component ---
const Toast = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-dismiss after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  const isSuccess = notification.type === "success";

  return (
    <AnimatePresence>
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ ease: "easeOut", duration: 0.3 }}
          className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg text-white ${
            isSuccess ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {isSuccess ? (
            <CheckCircle className="mr-3" />
          ) : (
            <XCircle className="mr-3" />
          )}
          <span>{notification.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Draggable Section Component (for the PREVIEW) ---
const SortablePreviewSection = ({ section, questions }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging
      ? "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
      : "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border border-slate-200 touch-none mb-6"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center p-4 cursor-grab bg-slate-50 rounded-t-lg border-b border-slate-200"
      >
        <GripVertical size={20} className="text-slate-400 mr-4" />
        <h2 className="text-xl font-semibold text-slate-700">
          {section.title}
        </h2>
      </div>
      <div className="p-6">
        {questions.map((q, index) => (
          <div key={q.id} className="mb-6 last:mb-0">
            <label className="block text-md font-medium text-slate-700 mb-3">
              {index + 1}. {q.label}
            </label>
            {q.type === "single-choice" && (
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <div key={opt.id} className="flex items-center">
                    <input
                      type="radio"
                      name={q.id}
                      id={opt.id}
                      className="h-4 w-4 text-indigo-600 border-slate-300"
                    />
                    <label
                      htmlFor={opt.id}
                      className="ml-3 block text-sm text-slate-600"
                    >
                      {opt.text}
                    </label>
                  </div>
                ))}
              </div>
            )}
            {q.type === "multi-choice" && (
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <div key={opt.id} className="flex items-center">
                    <input
                      type="checkbox"
                      name={q.id}
                      id={opt.id}
                      className="h-4 w-4 text-indigo-600 border-slate-300 rounded"
                    />
                    <label
                      htmlFor={opt.id}
                      className="ml-3 block text-sm text-slate-600"
                    >
                      {opt.text}
                    </label>
                  </div>
                ))}
              </div>
            )}
            {q.type === "short-text" && (
              <input
                type="text"
                placeholder="Your answer here..."
                className="w-full p-2 border border-slate-300 rounded-md"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Builder Component ---
export default function AssessmentBuilderPage() {
  const { jobId } = useParams();
  const [assessment, setAssessment] = useState({
    title: "New Assessment",
    sections: [{ id: generateId("sec"), title: "Section 1", questions: [] }],
  });
  const [sectionOrder, setSectionOrder] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const loadAssessment = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/assessments/${jobId}`);

        // If an assessment exists (200 OK), load it.
        // If not (404 Not Found), the component will just use the default state.
        if (response.ok) {
          const savedAssessmentRecord = await response.json();
          setAssessment(savedAssessmentRecord.assessmentData);
        } else if (response.status !== 404) {
           // Handle other errors besides "not found"
           throw new Error('Failed to load assessment');
        }

      } catch (error) {
        console.error("Failed to load assessment from API:", error);
        setNotification({
          show: true,
          message: "Could not load saved assessment.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadAssessment();
  }, [jobId]);

  useEffect(() => {
    const sectionIds = new Set(assessment.sections.map((s) => s.id));
    setSectionOrder((prevOrder) => {
      const newOrder = prevOrder.filter((id) => sectionIds.has(id));
      assessment.sections.forEach((sec) => {
        if (!newOrder.includes(sec.id)) {
          newOrder.push(sec.id);
        }
      });
      return newOrder;
    });
  }, [assessment.sections]);

  const handleSaveAssessment = async () => {
    try {
      const response = await fetch(`/api/assessments/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentData: assessment }),
      });

      if (!response.ok) {
        throw new Error('API responded with an error');
      }

      setNotification({
        show: true,
        message: "Assessment saved successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to save assessment:", error);
      setNotification({
        show: true,
        message: "Error: Could not save assessment.",
        type: "error",
      });
    }
  };

  const updateAssessmentTitle = (newTitle) =>
    setAssessment((prev) => ({ ...prev, title: newTitle }));
  const addSection = () => {
    const newSection = {
      id: generateId("sec"),
      title: `New Section ${assessment.sections.length + 1}`,
      questions: [],
    };
    setAssessment((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };
  const updateSectionTitle = (sectionId, newTitle) =>
    setAssessment((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, title: newTitle } : sec
      ),
    }));
  const addQuestion = (sectionId, type) => {
    const newQuestion = {
      id: generateId("q"),
      type,
      label: `New ${type.replace("-", " ")} question`,
      options: ["single-choice", "multi-choice"].includes(type)
        ? [{ id: generateId("opt"), text: "Option 1" }]
        : [],
    };
    setAssessment((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId
          ? { ...sec, questions: [...sec.questions, newQuestion] }
          : sec
      ),
    }));
  };
  const updateQuestionProp = (sectionId, qId, prop, val) =>
    setAssessment((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id !== sectionId
          ? sec
          : {
              ...sec,
              questions: sec.questions.map((q) =>
                q.id === qId ? { ...q, [prop]: val } : q
              ),
            }
      ),
    }));
  const addOption = (sectionId, qId) =>
    setAssessment((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id !== sectionId
          ? sec
          : {
              ...sec,
              questions: sec.questions.map((q) =>
                q.id !== qId
                  ? q
                  : {
                      ...q,
                      options: [
                        ...q.options,
                        { id: generateId("opt"), text: "New Option" },
                      ],
                    }
              ),
            }
      ),
    }));
  const updateOptionText = (sectionId, qId, optId, text) =>
    setAssessment((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id !== sectionId
          ? sec
          : {
              ...sec,
              questions: sec.questions.map((q) =>
                q.id !== qId
                  ? q
                  : {
                      ...q,
                      options: q.options.map((opt) =>
                        opt.id === optId ? { ...opt, text } : opt
                      ),
                    }
              ),
            }
      ),
    }));
  const removeOption = (sectionId, qId, optId) =>
    setAssessment((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id !== sectionId
          ? sec
          : {
              ...sec,
              questions: sec.questions.map((q) =>
                q.id !== qId
                  ? q
                  : {
                      ...q,
                      options: q.options.filter((opt) => opt.id !== optId),
                    }
              ),
            }
      ),
    }));
  const handlePreviewDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSectionOrder((currentOrder) =>
        arrayMove(
          currentOrder,
          currentOrder.indexOf(active.id),
          currentOrder.indexOf(over.id)
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100 text-slate-500">
        Loading Assessment...
      </div>
    );
  }

  return (
    <>
      <Toast
        notification={notification}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <div className="flex flex-col h-screen font-sans bg-slate-100">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10 border-b border-slate-200">
          <div>
            <Link
              to={`/jobs/${jobId}`}
              className="flex items-center text-slate-600 hover:text-indigo-600 group"
            >
              <ArrowLeft size={18} className="mr-2" /> Back to Job
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">
              Assessment Builder
            </h1>
          </div>
          <button
            onClick={handleSaveAssessment}
            className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
          >
            Save Assessment
          </button>
        </header>

        <div className="flex flex-grow overflow-hidden">
          <div className="w-1/2 bg-white p-6 overflow-y-auto border-r border-slate-200">
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Assessment Title
              </label>
              <input
                type="text"
                value={assessment.title}
                onChange={(e) => updateAssessmentTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <hr className="border-slate-200" />
            {assessment.sections.map((section) => (
              <details
                key={section.id}
                open
                className="group border-b border-slate-200 last:border-b-0 py-4"
              >
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      updateSectionTitle(section.id, e.target.value)
                    }
                    className="text-xl font-semibold text-slate-700 w-full p-1 -ml-1 rounded bg-transparent hover:bg-slate-100 focus:bg-slate-100"
                  />
                  <ChevronDown
                    size={20}
                    className="text-slate-500 group-open:rotate-180 transition-transform"
                  />
                </summary>
                <div className="mt-4 pl-2">
                  {section.questions.map((q, index) => (
                    <div
                      key={q.id}
                      className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4"
                    >
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        Question #{index + 1}
                      </label>
                      <input
                        type="text"
                        value={q.label}
                        onChange={(e) =>
                          updateQuestionProp(
                            section.id,
                            q.id,
                            "label",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-slate-300 rounded-md"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Type: {q.type}
                      </p>
                      {["single-choice", "multi-choice"].includes(q.type) && (
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-medium text-slate-600">
                            Options
                          </h4>
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) =>
                                  updateOptionText(
                                    section.id,
                                    q.id,
                                    opt.id,
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-slate-200 rounded-md"
                              />
                              <button
                                onClick={() =>
                                  removeOption(section.id, q.id, opt.id)
                                }
                                className="p-2 text-slate-400 hover:text-red-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addOption(section.id, q.id)}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                          >
                            + Add Option
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="mt-6 p-2 border-t border-dashed border-slate-300">
                    <h4 className="text-sm font-medium text-slate-600 mb-2">
                      Add Question
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                      <button
                        onClick={() => addQuestion(section.id, "single-choice")}
                        className="text-xs p-2 bg-slate-100 border border-slate-200 rounded hover:bg-indigo-50 hover:border-indigo-300"
                      >
                        Single Choice
                      </button>
                      <button
                        onClick={() => addQuestion(section.id, "multi-choice")}
                        className="text-xs p-2 bg-slate-100 border border-slate-200 rounded hover:bg-indigo-50 hover:border-indigo-300"
                      >
                        Multi-Choice
                      </button>
                      <button
                        onClick={() => addQuestion(section.id, "short-text")}
                        className="text-xs p-2 bg-slate-100 border border-slate-200 rounded hover:bg-indigo-50 hover:border-indigo-300"
                      >
                        Short Text
                      </button>
                    </div>
                  </div>
                </div>
              </details>
            ))}
            <button
              onClick={addSection}
              className="mt-6 w-full flex items-center justify-center p-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
              <PlusCircle size={20} className="mr-2" /> Add New Section
            </button>
          </div>

          <div
            className="w-1/2 p-8 overflow-y-auto bg-slate-200"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23cbd5e1' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold mb-2 text-slate-800">
                {assessment.title}
              </h1>
              <p className="text-slate-500 mb-8">
                Rank the following sections by dragging them into your desired
                order.
              </p>
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handlePreviewDragEnd}
              >
                <SortableContext
                  items={sectionOrder}
                  strategy={verticalListSortingStrategy}
                >
                  {sectionOrder.map((sectionId) => {
                    const section = assessment.sections.find(
                      (s) => s.id === sectionId
                    );
                    if (!section) return null;
                    return (
                      <SortablePreviewSection
                        key={section.id}
                        section={section}
                        questions={section.questions}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}