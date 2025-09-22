import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from "@dnd-kit/core";
import { ArrowLeft, LoaderCircle, Users } from "lucide-react";
import { KanbanColumn } from "./KanbanColumn";
import { CandidateCard } from "./CandidateCard";
import Toast from "../jobs/Toast";

// --- API Service (no changes) ---
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
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const { jobId } = useParams();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
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
    STAGES.forEach((stage) => { grouped[stage] = []; });
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
    setOriginalApplications(applications);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const overStage = over.data.current?.stageId;
    const activeApp = applications.find((app) => app.id === active.id);
    if (!activeApp || !overStage || activeApp.stage === overStage) {
      return;
    }
    setApplications((prevApps) => {
      return prevApps.map((app) => {
        if (app.id === active.id) {
          return { ...app, stage: overStage };
        }
        return app;
      });
    });
  };

  const handleDragEnd = async (event) => {
    setActiveApplication(null);
    const { active, over } = event;
    const originalApp = originalApplications.find((app) => app.id === active.id);
    const originalStage = originalApp?.stage;
    const overStage = over?.data.current?.stageId;

    if (!over || !overStage || originalStage === overStage) {
      setApplications(originalApplications);
      return;
    }

    const originalStageIndex = STAGES.indexOf(originalStage);
    const newStageIndex = STAGES.indexOf(overStage);
    if (newStageIndex < originalStageIndex && overStage !== "rejected") {
      setNotification({ show: true, message: "Cannot move candidate to a previous stage.", type: "error" });
      setApplications(originalApplications);
      return;
    }

    try {
      await api.updateApplication(active.id, { stage: overStage });
      setNotification({ show: true, message: `Candidate moved to ${STAGE_NAMES[overStage]}`, type: "success" });
      setOriginalApplications(applications);
    } catch (error) {
      setNotification({ show: true, message: error.message, type: "error" });
      setApplications(originalApplications);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <LoaderCircle size={48} className="animate-spin text-blue-400" />
          <p className="text-slate-400">Loading candidate pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-900 text-slate-100 font-sans">
      <Toast
        notification={notification}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <header className="flex-shrink-0 border-b border-slate-700 bg-slate-900/70 backdrop-blur-sm px-4 py-2"> {/* REDUCED PADDING */}
        <div className="flex items-center justify-between">
            <div>
                 <Link to={`/jobs/${jobId}`} className="group mb-0.5 flex w-fit items-center text-xl text-blue-400 hover:text-blue-300"> {/* REDUCED MARGIN, FONT */}
                    <ArrowLeft size={19} className="mr-1.5 transition-transform group-hover:-translate-x-1" /> Back to Job Details
                </Link>
                <h1 className="text-2xl font-bold text-slate-100"> {/* REDUCED FONT */}
                    {job?.title} <span className="font-bold text-slate-400">| Candidate Pipeline</span>
                </h1>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-sm"> {/* REDUCED PADDING/SPACING */}
              <Users size={14} className="text-slate-400" /> {/* REDUCED ICON */}
              <span className="text-slate-200 font-semibold">{applications.length}</span>
              <span className="text-slate-400">Applicants</span> {/* Shortened text */}
            </div>
        </div>
      </header>

      {/* CHANGED: main now has overflow-y-auto and scrollbar styles */}
      <main className="flex-grow p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50"> {/* REDUCED PADDING */}
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* CHANGED: gridTemplateColumns to ensure all columns fit. minmax(180px, 1fr) for narrower columns */}
          <div className="grid h-full gap-3" style={{ gridTemplateColumns: `repeat(${STAGES.length}, minmax(180px, 1fr))`}}> {/* REDUCED GAP */}
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