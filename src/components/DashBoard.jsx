import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Briefcase,
  Calendar,
  MapPin,
  LoaderCircle,
  Users,
  FileText,
  Award,
  ChevronRight,
  ClipboardList,
  UserCheck,
  Handshake,
  Trophy,
} from "lucide-react";
import JobModal from "./jobs/JobModal";
import Toast from "./jobs/Toast";
import { paginate } from "../utils/pagination";
import PaginationControls from "../utils/PaginationControls";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableJobCard } from "./jobs/SortableJobCard";
import { motion, AnimatePresence } from "framer-motion";

// --- API Service updated with a new function ---
const api = {
  async getDashboardStats() {
    const response = await fetch("/api/dashboard/stats");
    if (!response.ok) throw new Error("Failed to fetch dashboard stats");
    return response.json();
  },
  // --- NEW: Function to fetch real pipeline data ---
  async getPipelineStats() {
    const response = await fetch("/api/pipeline-stats");
    if (!response.ok) throw new Error("Failed to fetch pipeline stats");
    return response.json();
  },
  async getJobs(filters) {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`/api/jobs?${query}`);
    if (!response.ok) throw new Error("Failed to fetch jobs");
    return response.json();
  },
  async createJob(jobData) {
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });
    if (!response.ok) throw new Error("Failed to create job");
    return response.json();
  },
  async reorderJobs(orderedIds) {
    const response = await fetch("/api/jobs/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
    if (!response.ok) throw new Error("Failed to reorder jobs");
    return response.json();
  },
};

// --- Unchanged Components: PipelineChart, DashboardHeader, StatsCard ---
const PipelineChart = ({ data }) => (
  <div className="space-y-4">
    {data.map((stage, index) => (
      <div key={stage.name} className="grid grid-cols-4 items-center gap-4">
        <div className="col-span-1 flex items-center gap-2">
          <stage.icon
            className="w-5 h-5"
            style={{ color: stage.color }}
            aria-hidden="true"
          />
          <span className="font-medium text-sm text-slate-300">
            {stage.name}
          </span>
        </div>
        <div className="col-span-3">
          <div className="flex items-center">
            <div className="w-full bg-slate-700/50 rounded-full h-2.5 mr-3">
              <motion.div
                className="h-2.5 rounded-full"
                style={{
                  background: `linear-gradient(to right, ${stage.color}, ${stage.gradientTo})`,
                }}
                initial={{ width: "0%" }}
                animate={{ width: `${stage.percentage}%` }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
              />
            </div>
            <span className="font-semibold text-white text-sm w-12 text-right">
              {stage.count}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const DashboardHeader = ({ stats }) => (
  <header className="p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Here's your hiring overview for September 2025.
        </p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatsCard
        icon={Briefcase}
        title="Active Jobs"
        value={stats.activeJobs}
        color="from-blue-500 to-sky-400"
      />
      <StatsCard
        icon={Users}
        title="Total Candidates"
        value={stats.totalCandidates}
        color="from-purple-500 to-indigo-400"
      />
      <StatsCard
        icon={FileText}
        title="Applications"
        value={stats.totalApplications}
        color="from-amber-500 to-yellow-400"
      />
      <StatsCard
        icon={Award}
        title="Hired this month"
        value={stats.totalHired}
        color="from-green-500 to-emerald-400"
      />
    </div>
  </header>
);

const StatsCard = ({ icon: Icon, title, value, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={`relative p-5 rounded-xl overflow-hidden bg-slate-800 border border-slate-700`}
  >
    <div
      className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-l ${color} opacity-20 rounded-full blur-2xl`}
    />
    <div className="relative z-10">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-slate-300 font-medium">{title}</p>
          <p className="text-4xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color} shadow-lg`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  </motion.div>
);

export const DashBoardPage = () => {
  // --- All state and logic hooks remain unchanged, except for adding pipelineData ---
  const [allJobs, setAllJobs] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "active", searchTerm: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [globalStats, setGlobalStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    totalApplications: 0,
    totalHired: 0,
  });
  // --- NEW: State to hold real pipeline data ---
  const [pipelineData, setPipelineData] = useState([]);

  const ITEMS_PER_PAGE = 5;
  const navigate = useNavigate();
  const wasDragged = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  );

  // --- fetchData updated to include the new API call ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiFilters = {
        status: filters.status === "all" ? "" : filters.status,
        title: filters.searchTerm,
      };
      // Fetch all data concurrently
      const [jobsData, statsData, pipelineStatsData] = await Promise.all([
        api.getJobs(apiFilters),
        api.getDashboardStats(),
        api.getPipelineStats(), // Fetch real pipeline data
      ]);
      setAllJobs(jobsData);
      setGlobalStats(statsData);
      setPipelineData(pipelineStatsData); // Store real data in state
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // --- This hook adds UI properties (icons, colors, etc.) to the real data ---
  const processedPipelineData = useMemo(() => {
    const stageConfig = {
      applied: {
        name: "Applied",
        icon: ClipboardList,
        color: "#38bdf8",
        gradientTo: "#3b82f6",
      },
      screening: {
        name: "Screening",
        icon: UserCheck,
        color: "#a78bfa",
        gradientTo: "#8b5cf6",
      },
      interview: {
        name: "Interview",
        icon: Handshake,
        color: "#facc15",
        gradientTo: "#fbbf24",
      },
      offer: {
        name: "Offer",
        icon: Award,
        color: "#fb923c",
        gradientTo: "#f97316",
      },
      hired: {
        name: "Hired",
        icon: Trophy,
        color: "#4ade80",
        gradientTo: "#22c55e",
      },
    };

    const totalApplied =
      pipelineData.find((p) => p.stage === "applied")?.count || 0;
    if (totalApplied === 0) return [];

    return pipelineData.map(({ stage, count }) => ({
      ...stageConfig[stage],
      count,
      percentage: ((count / totalApplied) * 100).toFixed(1),
    }));
  }, [pipelineData]);

  // --- All handler functions and other effects remain unchanged ---
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleDragStart = () => {
    wasDragged.current = false;
  };
  const handleDragMove = () => {
    wasDragged.current = true;
  };
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (wasDragged.current && active && over && active.id !== over.id) {
      const oldIndex = allJobs.findIndex((job) => job.id === active.id);
      const newIndex = allJobs.findIndex((job) => job.id === over.id);
      const newJobsOrder = arrayMove(allJobs, oldIndex, newIndex);
      const originalJobs = [...allJobs];
      setAllJobs(newJobsOrder);
      try {
        const orderedIds = newJobsOrder.map((job) => job.id);
        await api.reorderJobs(orderedIds);
        setNotification({
          show: true,
          message: "Job order saved!",
          type: "success",
        });
      } catch (err) {
        setAllJobs(originalJobs);
        setNotification({ show: true, message: err.message, type: "error" });
      }
    }
  };
  const handleCardClick = (jobId) => {
    if (!wasDragged.current) {
      navigate(`/jobs/${jobId}`);
    }
    wasDragged.current = false;
  };
  const paginatedJobs = useMemo(
    () => paginate(allJobs, currentPage, ITEMS_PER_PAGE),
    [allJobs, currentPage]
  );
  const totalPages = Math.ceil(allJobs.length / ITEMS_PER_PAGE);
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);
  const handleCreateJob = async (jobData) => {
    try {
      await api.createJob(jobData);
      fetchData();
      setIsCreateModalOpen(false);
      setNotification({
        show: true,
        message: "New job created!",
        type: "success",
      });
    } catch (err) {
      setNotification({ show: true, message: err.message, type: "error" });
    }
  };
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };
  const clearFilters = () => {
    setFilters({ status: "active", searchTerm: "" });
  };
  const jobRoleOptions = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Product Manager",
    "UI/UX Designer",
    "QA Engineer",
    "Mobile Developer",
    "Data Analyst",
    "Software Architect",
    "Technical Lead",
    "Business Analyst",
    "Marketing Manager",
    "Sales Executive",
    "HR Specialist",
    "Content Writer",
    "Graphic Designer",
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans">
      <Toast
        notification={notification}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <DashboardHeader stats={globalStats} />

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                Active Job Postings
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50"
              >
                <Plus size={20} />
                <span>Create Job</span>
              </button>
            </div>

            <AnimatePresence>
              {isLoading ? (
                <motion.div
                  key="loader"
                  className="flex items-center justify-center h-96"
                >
                  <LoaderCircle
                    size={48}
                    className="text-indigo-500 animate-spin"
                  />
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  className="flex items-center justify-center h-96 text-center text-red-400"
                >
                  <p>Error: {error}.</p>
                </motion.div>
              ) : allJobs.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-96 text-center rounded-xl bg-slate-800/50 border border-slate-700"
                >
                  <div className="bg-slate-700/50 rounded-full p-6 mb-4">
                    <Briefcase size={48} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No jobs found
                  </h3>
                  <p className="text-slate-400 mb-6 max-w-md">
                    Create your first job posting to see it here.
                  </p>
                </motion.div>
              ) : (
                <motion.div key="job-list">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={allJobs.map((job) => job.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {paginatedJobs.map((job) => (
                          <div
                            key={job.id}
                            onClick={() => handleCardClick(job.id)}
                          >
                            <SortableJobCard job={job}>
                              <JobCard job={job} />
                            </SortableJobCard>
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsCount={allJobs.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="lg:col-span-1 space-y-6 self-start top-6 sticky">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Hiring Pipeline
              </h2>
              {/* Pass the processed real data to the chart */}
              <PipelineChart data={processedPipelineData} />
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Filter size={18} className="mr-2 text-indigo-400" />
                Filters
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500"
                    />
                    <input
                      type="text"
                      placeholder="Job title..."
                      value={filters.searchTerm}
                      onChange={(e) =>
                        handleFilterChange("searchTerm", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-white transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-white transition appearance-none"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {isCreateModalOpen && (
        <JobModal
          job={null}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateJob}
          jobRoleOptions={jobRoleOptions}
        />
      )}
    </div>
  );
};

// --- JobCard remains unchanged ---
const JobCard = ({ job }) => {
  // --- REMOVED ---
  // The mock data calculation is no longer needed.
  // const candidateCount = useMemo(...)

  return (
    <div className="group bg-slate-800/80 rounded-xl shadow-lg border border-slate-700 p-5 transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/50 hover:bg-slate-800 cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
              {job.title}
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                job.status === "active"
                  ? "bg-green-500/10 text-green-300 border border-green-500/20"
                  : "bg-slate-500/10 text-slate-300 border border-slate-500/20"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  job.status === "active" ? "bg-green-400" : "bg-slate-400"
                }`}
              ></span>
              {job.status === "active" ? "Active" : "Archived"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <Briefcase size={14} />
              <span>{job.role || job.department}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} />
              <span>{job.location}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center pl-5 ml-5 border-l border-slate-700">
          <div className="text-center">
            {/* --- CHANGED: Display the real count from the job object --- */}
            <p className="text-3xl font-bold text-white">
              {job.candidateCount || 0}
            </p>
            <p className="text-xs text-slate-400">Candidates</p>
          </div>
          <ChevronRight
            size={24}
            className="text-slate-600 ml-4 group-hover:text-indigo-400 transition-all group-hover:translate-x-1"
          />
        </div>
      </div>
    </div>
  );
};
