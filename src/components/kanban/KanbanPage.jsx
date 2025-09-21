import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  // 1. IMPORT the new collision strategy
  rectIntersection,
} from "@dnd-kit/core";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { KanbanColumn } from "./KanbanColumn";
import { CandidateCard } from "./CandidateCard";
import Toast from "../jobs/Toast"; // Assuming this is the correct path

// --- API Service (assuming this is in a separate file) ---
const api = {
  async getJobDetails(jobId) {
    const response = await fetch(`/api/jobs/${jobId}`);
    if (!response.ok) throw new Error("Job not found");
    return response.json();
  },
  async getApplicationsForJob(jobId) {
    const response = await fetch(`/api/applications?jobId=${jobId}`);
    if (!response.ok) throw new Error("Failed to fetch applications");
    return response.json();
  },
  async updateApplication(appId, updates) {
    const response = await fetch(`/api/applications/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update application stage");
    return response.json();
  },
};

const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];
const STAGE_NAMES = {
  applied: "Applied",
  screen: "Screening",
  tech: "Technical Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

export default function KanbanPage() {
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [activeApplication, setActiveApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const { jobId } = useParams();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Add a small activation delay to distinguish clicks from drags
      activationConstraint: { distance: 8 },
    })
  );

  const [originalApplications, setOriginalApplications] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [jobData, appsData] = await Promise.all([
          api.getJobDetails(jobId),
          api.getApplicationsForJob(jobId),
        ]);
        setJob(jobData);
        setApplications(appsData);
        setOriginalApplications(appsData);
      } catch (error) {
        setNotification({ show: true, message: error.message, type: "error" });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [jobId]);

  const applicationsByStage = useMemo(() => {
    const grouped = {};
    STAGES.forEach((stage) => {
      grouped[stage] = [];
    });
    applications.forEach((app) => {
      if (app && app.stage && grouped.hasOwnProperty(app.stage)) {
        grouped[app.stage].push(app);
      }
    });
    return grouped;
  }, [applications]);

  const handleDragStart = (event) => {
    const app = applications.find((app) => app.id === event.active.id);
    setActiveApplication(app || null);
    // Snapshot the state at the beginning of the drag
    setOriginalApplications(applications);
  };

  // **UPDATED LOGIC** for immutable state updates
  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // The stageId is derived from the droppable column's id
    const overStage = over.data.current?.stageId;
    const activeApp = applications.find((app) => app.id === active.id);

    if (!activeApp || !overStage || activeApp.stage === overStage) {
      return;
    }

    // This function provides a smooth visual update as the user drags an item over a new column.
    // It updates the state optimistically. handleDragEnd will handle API calls and rollbacks.
    setApplications((prevApps) => {
      // Using .map ensures we return a new array, which is crucial for React state updates.
      // This prevents direct mutation of the state.
      return prevApps.map((app) => {
        if (app.id === active.id) {
          // Create a new object for the updated application
          return { ...app, stage: overStage };
        }
        return app;
      });
    });
  };

  const handleDragEnd = async (event) => {
    setActiveApplication(null);
    const { active, over } = event;

    // Find the original stage from before the drag started
    const originalApp = originalApplications.find(
      (app) => app.id === active.id
    );
    const originalStage = originalApp?.stage;

    // Find the stage being dropped over
    const overStage = over?.data.current?.stageId;

    // If dropped in the same place, or outside a valid column, revert to the original state
    if (!over || !overStage || originalStage === overStage) {
      setApplications(originalApplications);
      return;
    }

    // Validate the move (e.g., can't go backwards, except to 'rejected')
    const originalStageIndex = STAGES.indexOf(originalStage);
    const newStageIndex = STAGES.indexOf(overStage);

    if (newStageIndex < originalStageIndex && overStage !== "rejected") {
      setNotification({
        show: true,
        message: "Cannot move candidate to a previous stage.",
        type: "error",
      });
      setApplications(originalApplications); // Revert on invalid move
      return;
    }

    // The UI state is already correct from handleDragOver, now persist the change
    try {
      await api.updateApplication(active.id, { stage: overStage });
      setNotification({
        show: true,
        message: `Candidate moved to ${STAGE_NAMES[overStage]}`,
        type: "success",
      });
      // API call succeeded, so the current optimistic state becomes the new source of truth
      setOriginalApplications(applications);
    } catch (error) {
      setNotification({ show: true, message: error.message, type: "error" });
      // If the API call fails, revert the UI to its state before the drag started
      setApplications(originalApplications);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <LoaderCircle size={48} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-900 text-white">
      <Toast
        notification={notification}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <header className="flex-shrink-0 border-b border-gray-700 bg-gray-800 px-6 py-4 shadow-lg">
        <Link
          to={`/jobs/${jobId}`}
          className="group mb-4 flex w-fit items-center text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Job Details
        </Link>
        <h1 className="text-2xl font-bold">
          Candidate Kanban for:{" "}
          <span className="text-purple-400">{job?.title}</span>
        </h1>
      </header>

      <main className="flex-grow overflow-x-auto p-4 md:p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage}
                id={stage}
                title={STAGE_NAMES[stage]}
                applications={applicationsByStage[stage] || []}
              />
            ))}
          </div>
          <DragOverlay>
            {activeApplication ? (
              <CandidateCard application={activeApplication} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}