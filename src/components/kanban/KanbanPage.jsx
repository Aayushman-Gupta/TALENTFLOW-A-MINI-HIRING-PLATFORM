import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { KanbanColumn } from "./KanbanColumn";
import { CandidateCard } from "./CandidateCard";
import Toast from "../jobs/Toast"; // Assuming this is the correct path

// --- API Service ---
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
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

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
      if (app && app.stage && grouped[app.stage]) {
        grouped[app.stage].push(app);
      }
    });
    return grouped;
  }, [applications]);

  const handleDragStart = (event) => {
    setActiveApplication(
      applications.find((app) => app.id === event.active.id) || null
    );
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveApplication(null);

    if (!over) return;

    const activeId = active.id;
    const activeApp = applications.find((app) => app.id === activeId);
    if (!activeApp) return;

    // Find the stage of the column the card was dropped over
    const overStage =
      STAGES.find((stage) =>
        applicationsByStage[stage].some((app) => app.id === over.id)
      ) || over.id;

    if (activeApp.stage === overStage) {
      return; // No change if dropped in the same column
    }

    const originalStageIndex = STAGES.indexOf(activeApp.stage);
    const newStageIndex = STAGES.indexOf(overStage);

    // Enforce the "progress only" rule (can't move backwards)
    if (newStageIndex < originalStageIndex) {
      setNotification({
        show: true,
        message: "Cannot move candidate to a previous stage.",
        type: "error",
      });
      return;
    }

    // --- This is the corrected logic ---
    // 1. Optimistic UI Update: Immediately move the card in the UI
    const originalApplications = [...applications];
    setApplications((prevApps) =>
      prevApps.map((app) =>
        app.id === activeId ? { ...app, stage: overStage } : app
      )
    );

    // 2. API Call: Persist the change to the database
    try {
      await api.updateApplication(activeId, { stage: overStage });
      setNotification({
        show: true,
        message: `Candidate moved to ${STAGE_NAMES[overStage]}`,
        type: "success",
      });
    } catch (error) {
      setNotification({ show: true, message: error.message, type: "error" });
      // 3. Rollback on Failure: If the API call fails, revert the UI to its original state
      setApplications(originalApplications);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoaderCircle size={48} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Toast
        notification={notification}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <header className="bg-gray-800 shadow-lg border-b border-gray-700 px-6 py-4 flex-shrink-0">
        <Link
          to={`/jobs/${jobId}`}
          className="flex items-center text-blue-400 hover:text-blue-300 mb-4 group w-fit"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Job Details
        </Link>
        <h1 className="text-2xl font-bold">
          Candidate Kanban for:{" "}
          <span className="text-purple-400">{job?.title}</span>
        </h1>
      </header>

      <main className="flex-grow p-6 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* --- THIS IS THE NEW RESPONSIVE GRID LAYOUT --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage}
                id={stage}
                title={STAGE_NAMES[stage]}
                applications={applicationsByStage[stage]}
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
