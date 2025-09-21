import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function CandidateCard({ application, isOverlay }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.id,
    // **UPDATED**: Adding the stageId here is key.
    data: {
      type: "Application",
      application,
      stageId: application.stage,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isOverlay
      ? "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)"
      : "none",
    cursor: "grab",
  };

  const candidate = application.candidate || {
    name: "Unknown Candidate",
    email: "no-email@provided.com",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-sm shadow-sm transition-shadow duration-200 hover:border-gray-600"
    >
      <p className="font-bold text-gray-100">{candidate.name}</p>
      <p className="truncate text-xs text-gray-400">{candidate.email}</p>
    </div>
  );
}