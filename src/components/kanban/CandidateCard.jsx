import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Mail } from "lucide-react";

export function CandidateCard({ application, isOverlay }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: application.id,
    data: {
      type: 'application',
      application: application,
      stage: application.stage
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  // Overlay version (what you see while dragging)
  if (isOverlay) {
    return (
      <div className="bg-gray-700 p-3 rounded-lg border border-purple-500 shadow-2xl w-64 opacity-95">
        <div className="flex items-start">
          <div className="cursor-grabbing p-1 text-purple-400">
            <GripVertical size={16} />
          </div>
          <div className="ml-2 flex-grow">
            <div className="font-semibold text-sm text-white">
              {application.candidate?.name || 'Unknown Candidate'}
            </div>
            <div className="text-xs text-gray-300 flex items-center mt-1">
              <Mail size={12} className="mr-1.5" />
              {application.candidate?.email || 'No email'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular card version
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-blue-500 transition-all cursor-pointer ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : 'opacity-100'
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start">
        <div className="cursor-grab p-1 text-gray-500 hover:text-white">
          <GripVertical size={16} />
        </div>
        <div className="ml-2 flex-grow">
          <p className="font-semibold text-sm text-white">
            {application.candidate?.name || 'Unknown Candidate'}
          </p>
          <p className="text-xs text-gray-400 flex items-center mt-1">
            <Mail size={12} className="mr-1.5" />
            {application.candidate?.email || 'No email'}
          </p>
        </div>
      </div>
    </div>
  );
}