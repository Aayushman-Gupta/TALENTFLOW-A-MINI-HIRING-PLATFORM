import React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CandidateCard } from "./CandidateCard";

export function KanbanColumn({ id, title, applications }) {
  // Set this column as a droppable area, identified by its stage 'id' (e.g., 'screen')
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="bg-slate-800 rounded-lg p-3 flex flex-col border border-slate-700"
    >
      <h3 className="font-bold text-md mb-4 text-center text-gray-300 tracking-wider">
        {title} <span className="text-gray-500">{applications.length}</span>
      </h3>
      {/* The column content is scrollable if it exceeds the available height */}
      <div className="space-y-3 min-h-[200px] flex-grow overflow-y-auto pr-1">
        <SortableContext
          items={applications.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <CandidateCard key={app.id} application={app} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
