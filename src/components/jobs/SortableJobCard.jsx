import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- CHANGE: The component now accepts an 'isDragging' prop ---
export function SortableJobCard({ job, children, isDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    // We can use the hook's own state for styling, which is more efficient
    isDragging: isCurrentlySorting,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Style the card being dragged
    opacity: isCurrentlySorting ? 0.5 : 1,
    zIndex: isCurrentlySorting ? 10 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab touch-none"
    >
      {/* This is the key to passing the prop down.
        React.cloneElement creates a copy of the child (your JobCard)
        and injects the new isDragging prop into it.
      */}
      {React.cloneElement(children, { isDragging })}
    </div>
  );
}