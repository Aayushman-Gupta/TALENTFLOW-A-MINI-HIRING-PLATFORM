import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Mail } from "lucide-react";

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
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // The DragOverlay renders this special version of the card while dragging
  if (isOverlay) {
    return (
      <div className="bg-gray-700 p-3 rounded-lg border border-purple-500 shadow-2xl w-64">
        <div className="font-semibold text-sm text-white">
          {application.candidate?.name}
        </div>
        <div className="text-xs text-gray-400">
          {application.candidate?.email}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-800 p-3 rounded-lg border border-gray-700 touch-none hover:border-blue-500"
    >
      <div className="flex items-start">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab p-1 text-gray-500 hover:text-white"
        >
          <GripVertical size={16} />
        </div>
        <div className="ml-2 flex-grow">
          <p className="font-semibold text-sm text-white">
            {application.candidate?.name}
          </p>
          <p className="text-xs text-gray-400 flex items-center mt-1">
            <Mail size={12} className="mr-1.5" />
            {application.candidate?.email}
          </p>
        </div>
      </div>
    </div>
  );
}
