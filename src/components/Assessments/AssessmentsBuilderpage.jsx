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
  List,
  Trash2,
  ArrowLeft,
  ChevronDown,
  GripVertical,
  CheckCircle,
  XCircle,
  FileText,
  Settings,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- LOGIC REMAINS UNCHANGED ---
const generateId = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const Toast = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
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
          className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg text-white ${
            isSuccess ? "bg-green-600" : "bg-red-600"
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

// --- UI REMAINS THE SAME (ALREADY DARK THEMED) ---
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-slate-800 rounded-lg border border-slate-700 touch-none mb-6 shadow-lg"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center p-4 cursor-grab bg-slate-900/50 rounded-t-lg border-b border-slate-700"
      >
        <GripVertical size={20} className="text-slate-500 mr-4" />
        <h2 className="text-xl font-semibold text-slate-200">
          {section.title}
        </h2>
      </div>
      <div className="p-6 space-y-6">
        {questions.map((q, index) => (
          <div key={q.id}>
            <label className="block text-md font-medium text-slate-300 mb-3">
              {index + 1}. {q.label}
            </label>
            {["single-choice", "multi-choice"].includes(q.type) && (
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-center p-3 bg-slate-700/50 border border-slate-600 rounded-md"
                  >
                    <div
                      className={`h-4 w-4 border-2 border-slate-500 ${
                        q.type === "single-choice" ? "rounded-full" : "rounded"
                      }`}
                    />
                    <span className="ml-3 block text-sm text-slate-400">
                      {opt.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {q.type === "short-text" && (
              <div className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-sm text-slate-500">
                Candidate's answer...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

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

  // --- ALL LOGIC (useEffect, handleSave, update functions) IS UNCHANGED ---
  useEffect(() => {
    const loadAssessment = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/assessments/${jobId}`);
        if (response.ok) {
          const saved = await response.json();
          setAssessment(saved.assessmentData);
          setSectionOrder(saved.assessmentData.sections.map((s) => s.id));
        } else if (response.status !== 404) {
          throw new Error("Failed to load assessment");
        }
      } catch (error) {
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentData: assessment }),
      });
      if (!response.ok) {
        throw new Error("API error");
      }
      setNotification({
        show: true,
        message: "Assessment saved successfully!",
        type: "success",
      });
    } catch (error) {
      setNotification({
        show: true,
        message: "Error: Could not save.",
        type: "error",
      });
    }
  };
  const updateAssessmentTitle = (newTitle) =>
    setAssessment((prev) => ({ ...prev, title: newTitle }));
  const addSection = () =>
    setAssessment((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: generateId("sec"),
          title: `New Section ${prev.sections.length + 1}`,
          questions: [],
        },
      ],
    }));
  const updateSectionTitle = (sectionId, newTitle) =>
    setAssessment((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, title: newTitle } : sec
      ),
    }));
  const addQuestion = (sectionId, type) =>
    setAssessment((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId
          ? {
              ...sec,
              questions: [
                ...sec.questions,
                {
                  id: generateId("q"),
                  type,
                  label: `New ${type.replace("-", " ")} question`,
                  options: ["single-choice", "multi-choice"].includes(type)
                    ? [{ id: generateId("opt"), text: "Option 1" }]
                    : [],
                },
              ],
            }
          : sec
      ),
    }));
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

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-300">
        Loading...
      </div>
    );

  return (
    <>
      <Toast
        notification={notification}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      {/* --- UI THEME UPDATED TO DARK --- */}
      <div className="flex flex-col h-screen font-sans bg-slate-900 text-slate-300">
        <header className="bg-slate-800 p-4 flex justify-between items-center z-10 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-4">
            <Link
              to={`/jobs/${jobId}`}
              className="flex items-center text-slate-400 hover:text-indigo-400"
            >
              <ArrowLeft size={18} className="mr-2" /> Back to Job
            </Link>
            <div className="w-px h-6 bg-slate-600" />
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <FileText size={20} className="text-indigo-400" />
              Assessment Builder
            </h1>
          </div>
          <button
            onClick={handleSaveAssessment}
            className="bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
          >
            Save Assessment
          </button>
        </header>

        <div className="flex flex-grow overflow-hidden">
          {/* --- UI THEME UPDATED TO DARK --- */}
          <div className="w-1/2 bg-slate-800 p-6 overflow-y-auto border-r border-slate-700 space-y-6">
            <div className="p-4 border border-slate-700 rounded-lg">
              <label className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                <Settings size={16} /> Assessment Title
              </label>
              <input
                type="text"
                value={assessment.title}
                onChange={(e) => updateAssessmentTitle(e.target.value)}
                className="w-full text-2xl font-bold text-slate-100 p-2 -ml-2 rounded bg-transparent hover:bg-slate-700/50 focus:bg-slate-700/50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {assessment.sections.map((section) => (
              <details
                key={section.id}
                open
                className="group bg-transparent border border-slate-700 rounded-lg"
              >
                <summary className="flex justify-between items-center cursor-pointer list-none p-4">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      updateSectionTitle(section.id, e.target.value)
                    }
                    className="text-xl font-semibold text-slate-200 w-full p-1 -ml-1 rounded bg-transparent hover:bg-slate-700/50 focus:bg-slate-700/50"
                  />
                  <ChevronDown
                    size={20}
                    className="text-slate-400 group-open:rotate-180 transition-transform"
                  />
                </summary>
                <div className="p-4 border-t border-slate-700 space-y-4">
                  {section.questions.map((q, index) => (
                    <div
                      key={q.id}
                      className="bg-slate-900/50 p-4 rounded-lg border border-slate-700"
                    >
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
                        className="w-full p-2 border border-slate-600 rounded-md font-medium bg-slate-700 text-slate-200 placeholder:text-slate-400"
                        placeholder={`Question #${index + 1}`}
                      />
                      {["single-choice", "multi-choice"].includes(q.type) && (
                        <div className="mt-4 space-y-2">
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className="flex items-center space-x-2"
                            >
                              <div
                                className={`w-4 h-4 shrink-0 bg-slate-600 border-2 border-slate-500 ${
                                  q.type === "single-choice"
                                    ? "rounded-full"
                                    : "rounded-sm"
                                }`}
                              />
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
                                className="w-full p-2 border border-slate-600 rounded-md text-sm bg-slate-700 text-slate-300 placeholder:text-slate-500"
                                placeholder="Option text"
                              />
                              <button
                                onClick={() =>
                                  removeOption(section.id, q.id, opt.id)
                                }
                                className="p-2 text-slate-500 hover:text-red-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addOption(section.id, q.id)}
                            className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold pt-2 flex items-center gap-1"
                          >
                            <PlusCircle size={14} /> Add Option
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t border-dashed border-slate-600">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => addQuestion(section.id, "single-choice")}
                        className="flex items-center justify-center gap-2 text-sm p-2 bg-slate-700 border border-slate-600 rounded text-slate-300 hover:bg-slate-600 hover:border-indigo-500 hover:text-indigo-400"
                      >
                        <List size={14} />
                        Single Choice
                      </button>
                      <button
                        onClick={() => addQuestion(section.id, "multi-choice")}
                        className="flex items-center justify-center gap-2 text-sm p-2 bg-slate-700 border border-slate-600 rounded text-slate-300 hover:bg-slate-600 hover:border-indigo-500 hover:text-indigo-400"
                      >
                        <CheckSquare size={14} />
                        Multi-Choice
                      </button>
                      <button
                        onClick={() => addQuestion(section.id, "short-text")}
                        className="flex items-center justify-center gap-2 text-sm p-2 bg-slate-700 border border-slate-600 rounded text-slate-300 hover:bg-slate-600 hover:border-indigo-500 hover:text-indigo-400"
                      >
                        <Type size={14} />
                        Short Text
                      </button>
                    </div>
                  </div>
                </div>
              </details>
            ))}
            <button
              onClick={addSection}
              className="mt-6 w-full flex items-center justify-center p-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors"
            >
              <PlusCircle size={20} className="mr-2" /> Add New Section
            </button>
          </div>

          {/* --- PREVIEW PANEL (RIGHT - REMAINS UNCHANGED) --- */}
          <div className="w-1/2 p-8 overflow-y-auto bg-slate-900">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8 text-center">
                <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                  <Eye size={20} /> Live Preview
                </h2>
                <p className="text-slate-400 text-sm">
                  Drag sections to re-order them
                </p>
              </div>
              <h1 className="text-3xl font-bold mb-2 text-white text-center">
                {assessment.title}
              </h1>
              <p className="text-slate-400 mb-8 text-center">
                This is how the assessment will appear to candidates.
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
