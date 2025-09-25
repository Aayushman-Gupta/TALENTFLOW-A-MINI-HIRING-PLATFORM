import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader, Send, ArrowLeft, AlertCircle } from "lucide-react";

// This is the full-page component for a candidate to take an assessment.
export default function AssessmentRuntime({
  jobId,
  applicationId,
  candidateName,
  onClose,
  onSubmitted,
}) {
  const [assessment, setAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [responses, setResponses] = useState({});

  // Fetch the structure of the assessment
  useEffect(() => {
    const fetchAssessment = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/assessments/${jobId}`);
        if (!response.ok) {
          throw new Error(
            "Could not load the assessment structure. It may not have been created yet."
          );
        }
        const data = await response.json();
        setAssessment(data.assessmentData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssessment();
  }, [jobId]);

  const handleInputChange = (questionId, value) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleMultiChoiceChange = (questionId, optionValue, isChecked) => {
    const currentAnswers = responses[questionId] || [];
    if (isChecked) {
      setResponses((prev) => ({
        ...prev,
        [questionId]: [...currentAnswers, optionValue],
      }));
    } else {
      setResponses((prev) => ({
        ...prev,
        [questionId]: currentAnswers.filter((v) => v !== optionValue),
      }));
    }
  };

  // --- THIS FUNCTION CONTAINS THE FIX ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      // --- MODIFIED: The URL now correctly points to the submission endpoint from the project docs ---
      const response = await fetch(`/api/assessments/${jobId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // --- MODIFIED: We now send the applicationId along with the responses ---
        body: JSON.stringify({ applicationId, responses }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit responses.");
      }

      onSubmitted(); // Notify parent component
      onClose(); // Close the full-page view
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (q) => {
    const inputClasses =
      "w-full p-3 bg-slate-800 border border-slate-600 rounded-md text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none";

    switch (q.type) {
      case "short-text":
      case "long-text":
        return (
          <input
            type="text"
            value={responses[q.id] || ""}
            onChange={(e) => handleInputChange(q.id, e.target.value)}
            className={inputClasses}
            placeholder="Type your answer here..."
          />
        );
      case "single-choice":
        return (
          <div className="space-y-3">
            {q.options.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center p-3 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
              >
                <input
                  type="radio"
                  name={q.id}
                  value={opt.text}
                  onChange={(e) => handleInputChange(q.id, e.target.value)}
                  className="h-5 w-5 text-indigo-500 bg-slate-700 border-slate-600 focus:ring-indigo-500"
                />
                <span className="ml-4 text-slate-300">{opt.text}</span>
              </label>
            ))}
          </div>
        );
      case "multi-choice":
        return (
          <div className="space-y-3">
            {q.options.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center p-3 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
              >
                <input
                  type="checkbox"
                  name={q.id}
                  value={opt.text}
                  onChange={(e) =>
                    handleMultiChoiceChange(
                      q.id,
                      e.target.value,
                      e.target.checked
                    )
                  }
                  className="h-5 w-5 text-indigo-500 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
                />
                <span className="ml-4 text-slate-300">{opt.text}</span>
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 text-white overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <header className="sticky top-0 bg-gray-900/80 backdrop-blur-sm border-b border-slate-700 p-4 z-10">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {assessment?.title || "Assessment"}
              </h1>
              <p className="text-sm text-slate-400">For: {candidateName}</p>
            </div>
            <button
              onClick={onClose}
              className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Profile
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-8">
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader size={32} className="animate-spin text-indigo-400" />
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 text-red-300 p-4 rounded-lg flex items-center">
              <AlertCircle className="mr-3" /> {error}
            </div>
          )}

          <AnimatePresence>
            {assessment && !isLoading && (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {assessment.sections.map((section, sectionIndex) => (
                  <motion.div
                    key={section.id}
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: sectionIndex * 0.15 }}
                  >
                    <h2 className="text-2xl font-semibold border-b-2 border-indigo-500 pb-2 mb-6 text-slate-200">
                      {section.title}
                    </h2>
                    <div className="space-y-8">
                      {section.questions.map((q, qIndex) => (
                        <motion.div
                          key={q.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: qIndex * 0.1 + sectionIndex * 0.15,
                          }}
                        >
                          <label className="block text-lg font-medium text-slate-300 mb-3">
                            {qIndex + 1}. {q.label}
                          </label>
                          {renderQuestion(q)}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
                <div className="mt-12 text-right">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-600/40 disabled:bg-slate-600 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader size={20} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={16} className="mr-2" /> Submit Assessment
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
}
