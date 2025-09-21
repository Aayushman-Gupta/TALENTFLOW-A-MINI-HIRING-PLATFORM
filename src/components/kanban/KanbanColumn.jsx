import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CandidateCard } from "./CandidateCard";

export function KanbanColumn({ id, title, applications }) {
  const { setNodeRef } = useDroppable({
    id,
    // **ADDED**: This data tells dnd-kit what stage this column represents.
    data: {
      type: "Column",
      stageId: id,
    },
  });

  return (
    <div className="flex flex-col rounded-lg bg-gray-800/50">
      <h3 className="flex items-center justify-between rounded-t-lg bg-gray-800 p-3 text-sm font-semibold text-gray-200">
        {title}
        <span className="rounded-full bg-gray-700 px-2 py-1 text-xs font-bold text-gray-300">
          {applications.length}
        </span>
      </h3>
      <div
        ref={setNodeRef}
        className="flex flex-grow flex-col gap-3 overflow-y-auto p-3"
        style={{ minHeight: "100px" }}
      >
        <SortableContext
          items={applications.map((app) => app.id)}
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