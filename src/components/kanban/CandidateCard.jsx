import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
// --- MODIFIED: Add CheckCircle and Clock for the status indicator ---
import { Mail, CheckCircle, Clock } from "lucide-react";

// --- MODIFIED: Accept the new assessmentStatus prop ---
export function CandidateCard({ application, isOverlay, assessmentStatus }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.id,
    data: {
      type: "Application",
      application,
      stageId: application.stage,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms ease, box-shadow 250ms ease",
    opacity: isDragging ? 0.4 : 1,
    boxShadow: isOverlay
      ? "0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)"
      : "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  };

  const candidate = application.candidate || {
    name: "Unknown Candidate",
    email: "no-email@provided.com",
  };

  if (isOverlay) {
    style.transform = `${style.transform} rotate(5deg)`; // Tilt effect when dragging
  }

  // --- NEW: Function to render the visual status indicator ---
  const renderStatusIndicator = () => {
    // If the status is null (i.e., not in the 'tech' column), render nothing.
    if (!assessmentStatus) return null;

    if (assessmentStatus === 'submitted') {
      return (
        <div className="flex items-center text-xs text-green-400 mt-1.5" title="Assessment Submitted">
          <CheckCircle size={12} className="mr-1.5 flex-shrink-0" />
          <span>Submitted</span>
        </div>
      );
    }

    // Default to 'pending' for any other status
    return (
      <div className="flex items-center text-xs text-yellow-400 mt-1.5" title="Assessment Pending">
        <Clock size={12} className="mr-1.5 flex-shrink-0" />
        <span>Pending Assessment</span>
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-slate-800 rounded-md border border-slate-700 p-3 text-sm shadow-sm touch-none cursor-grab active:cursor-grabbing hover:border-blue-500 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-xs">
            {candidate.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <p className="font-bold text-slate-100 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
            {candidate.name}
          </p>
          <div className="flex items-center mt-1 text-slate-400">
            <Mail size={12} className="mr-1.5 flex-shrink-0" />
            <p className="text-xs break-all">{candidate.email}</p>
          </div>
          {/* --- Render the new indicator here --- */}
          {renderStatusIndicator()}
        </div>
      </div>
    </div>
  );
}