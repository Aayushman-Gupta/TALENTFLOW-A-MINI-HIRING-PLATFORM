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
import { ArrowLeft, LoaderCircle, Users, Search } from "lucide-react";
import { KanbanColumn } from "./KanbanColumn";
import { CandidateCard } from "./CandidateCard";
import Toast from "../jobs/Toast";

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
  tech: "Tech Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected"
};

export default function KanbanPage() {
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [activeApplication, setActiveApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const { jobId } = useParams();
  const [originalApplications, setOriginalApplications] = useState([]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredApplications = useMemo(() => {
    if (!searchTerm) {
      return applications;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return applications.filter(app => {
      const candidate = app.candidate;
      if (!candidate) return false;
      return (
        candidate.name.toLowerCase().includes(lowercasedFilter) ||
        candidate.email.toLowerCase().includes(lowercasedFilter)
      );
    });
  }, [applications, searchTerm]);

  const applicationsByStage = useMemo(() => {
    const grouped = {};
    STAGES.forEach((stage) => { grouped[stage] = []; });
    filteredApplications.forEach((app) => {
      if (app && app.stage && grouped.hasOwnProperty(app.stage)) {
        grouped[app.stage].push(app);
      }
    });
    return grouped;
  }, [filteredApplications]);

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
    if (!activeApp || !overStage || activeApp.stage === overStage) { return; }
    setApplications((prevApps) => prevApps.map((app) => (app.id === active.id ? { ...app, stage: overStage } : app)));
  };

  // UPDATED: handleDragEnd now contains validation logic
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

    // --- NEW VALIDATION LOGIC ---
    const originalStageIndex = STAGES.indexOf(originalStage);
    const newStageIndex = STAGES.indexOf(overStage);

    // Block the move if it's backwards, unless the destination is 'rejected'.
    if (newStageIndex < originalStageIndex && overStage !== 'rejected') {
      setNotification({
        show: true,
        message: "Candidates cannot be moved to a previous stage.",
        type: "error",
      });
      // Revert the optimistic UI update
      setApplications(originalApplications);
      return; // Prevent the API call
    }
    // --- END OF NEW LOGIC ---

    try {
      await api.updateApplication(active.id, { stage: overStage });
      setNotification({ show: true, message: `Moved to ${STAGE_NAMES[overStage]}`, type: "success" });
      // On success, the current state is correct, so we update our baseline
      setOriginalApplications(applications);
    } catch (error) {
      setNotification({ show: true, message: error.message, type: "error" });
      // On failure, revert to the state before the drag started
      setApplications(originalApplications);
    }
  };

  if (isLoading) { return ( <div className="flex h-screen items-center justify-center bg-slate-900"><LoaderCircle size={48} className="animate-spin text-blue-400" /></div> ); }

  return (
    <div className="flex h-screen flex-col bg-slate-900 text-slate-100 font-sans">
      <Toast notification={notification} onClose={() => setNotification({ ...notification, show: false })} />
      <header className="flex-shrink-0 border-b border-slate-700 bg-slate-900/70 backdrop-blur-sm px-4 py-2">
        <div className="flex items-center justify-between gap-4">
            <div>
                 <Link to={`/jobs/${jobId}`} className="group mb-0.5 flex w-fit items-center text-xs text-blue-400 hover:text-blue-300">
                    <ArrowLeft size={14} className="mr-1.5 transition-transform group-hover:-translate-x-1" /> Back to Job Details
                </Link>
                <h1 className="text-lg font-bold text-slate-100">
                    {job?.title} <span className="font-normal text-slate-400">| Candidate Pipeline</span>
                </h1>
            </div>
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
            </div>
        </div>
      </header>
      <main className="flex-grow p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50">
        <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="grid flex-grow gap-3 self-start" style={{ gridTemplateColumns: `repeat(${STAGES.length}, minmax(220px, 1fr))` }}>
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
            {activeApplication ? ( <CandidateCard application={activeApplication} isOverlay /> ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}

