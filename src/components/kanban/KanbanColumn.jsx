import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CandidateCard } from "./CandidateCard";

export function KanbanColumn({ id, title, applications }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "Column", stageId: id },
  });

  const columnBodyStyles = `
    flex-grow p-1 space-y-2 bg-slate-800/50 rounded-b-lg border-x border-b border-slate-700/80
    transition-colors duration-300 ease-in-out
    ${isOver ? "bg-slate-800/80" : ""}
  `;

  return (
    <div className="flex flex-col w-full self-start">
      <div className="flex items-center justify-between p-2 flex-shrink-0 rounded-t-lg bg-slate-700 text-slate-200">
        <h3 className="text-sm font-medium uppercase tracking-wider">{title}</h3>
        <span className="flex items-center justify-center text-xs font-semibold bg-black/25 rounded-full h-5 w-5">
          {applications.length}
        </span>
      </div>

      <div ref={setNodeRef} className={columnBodyStyles}>
        <SortableContext
          items={applications.map((app) => app.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <CandidateCard key={app.id} application={app} />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className="flex items-center justify-center h-16 m-1 text-xs text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
            No candidates
          </div>
        )}
      </div>
    </div>
  );
}