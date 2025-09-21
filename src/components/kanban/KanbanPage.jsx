import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { KanbanColumn } from "./KanbanColumn";
import { CandidateCard } from "./CandidateCard";
import Toast from "../jobs/Toast";

// --- API Service (assuming it exists) ---
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

  // Simplified sensor configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    })
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
    STAGES.forEach((stage) => (grouped[stage] = []));
    applications.forEach((app) => {
      if (app?.stage && grouped[app.stage]) {
        grouped[app.stage].push(app);
      }
    });
    return grouped;
  }, [applications]);

  const handleDragStart = (event) => {
    console.log("Drag started:", event.active.id);
    const draggedApp = applications.find((app) => app.id === event.active.id);
    setActiveApplication(draggedApp);
  };

  const handleDragEnd = async (event) => {
    console.log("Drag ended:", event);
    const { active, over } = event;

    setActiveApplication(null);

    if (!over) {
      console.log("No drop target found");
      return;
    }

    console.log("Active ID:", active.id, "Over ID:", over.id);

    const activeApp = applications.find((app) => app.id === active.id);
    if (!activeApp) {
      console.log("Could not find active application");
      return;
    }

    // Simple logic: if over.id is a stage, use it directly
    // If over.id is an application, find which stage it belongs to
    let newStage = over.id;

    if (!STAGES.includes(over.id)) {
      // We're dropping on an application, find its stage
      const overApp = applications.find(app => app.id === over.id);
      if (overApp) {
        newStage = overApp.stage;
      } else {
        console.log("Could not determine target stage");
        return;
      }
    }

    console.log("Current stage:", activeApp.stage, "New stage:", newStage);

    if (activeApp.stage === newStage) {
      console.log("Same stage, no change needed");
      return;
    }

    // Optional: Prevent moving backwards
    const currentIndex = STAGES.indexOf(activeApp.stage);
    const newIndex = STAGES.indexOf(newStage);

    if (newIndex < currentIndex) {
      setNotification({
        show: true,
        message: "Cannot move candidate to a previous stage.",
        type: "error",
      });
      return;
    }

    // Update local state immediately
    const updatedApplications = applications.map(app =>
      app.id === active.id ? { ...app, stage: newStage } : app
    );
    setApplications(updatedApplications);

    try {
      await api.updateApplication(active.id, { stage: newStage });
      setNotification({
        show: true,
        message: `Candidate moved to ${STAGE_NAMES[newStage]}`,
        type: "success",
      });
      console.log("Successfully updated application stage");
    } catch (error) {
      console.error("Failed to update application:", error);
      // Revert on error
      setApplications(applications);
      setNotification({
        show: true,
        message: error.message,
        type: "error"
      });
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
      <main className="flex-grow p-6 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 min-w-max">
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
              <CandidateCard
                application={activeApplication}
                isOverlay={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}