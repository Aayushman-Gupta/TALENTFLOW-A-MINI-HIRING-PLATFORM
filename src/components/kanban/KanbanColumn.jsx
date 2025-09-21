import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { CandidateCard } from "./CandidateCard";

export function KanbanColumn({ id, title, applications }) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: 'column',
      stage: id
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-slate-800 rounded-lg p-3 flex flex-col border transition-all ${
        isOver
          ? 'border-blue-500 bg-slate-700 shadow-lg'
          : 'border-slate-700'
      }`}
      style={{ minHeight: '400px' }}
    >
      <h3 className="font-bold text-md mb-4 text-center text-gray-300 tracking-wider">
        {title} <span className="text-gray-500">({applications.length})</span>
      </h3>

      <div className="space-y-3 flex-grow">
        {applications.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm border-2 border-dashed border-gray-600 rounded-lg">
            Drop here
          </div>
        ) : (
          applications.map((app) => (
            <CandidateCard key={app.id} application={app} />
          ))
        )}
      </div>
    </div>
  );
}