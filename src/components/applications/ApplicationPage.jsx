import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Filter,
  Search,
  Mail,
  Calendar,
  Hash,
  LoaderCircle,
  Users,
  LayoutDashboard,
} from "lucide-react";
import { paginate } from "../../utils/pagination";
import PaginationControls from "../../utils/PaginationControls";
import { motion, AnimatePresence } from "framer-motion";

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
};

const STAGE_OPTIONS = [
  "applied",
  "screen",
  "tech",
  "offer",
  "hired",
  "rejected",
];

// --- UI ENHANCEMENT: Color mapping for stage badges ---
const STAGE_COLORS = {
  applied: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  screen: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  tech: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  offer: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  hired: "bg-green-500/20 text-green-300 border-green-500/30",
  rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  default: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

export default function ApplicationsPage() {
  // --- All state and logic hooks remain unchanged ---
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const [filters, setFilters] = useState({
    stage: "all",
    searchTerm: "",
    appliedDate: "all",
  });
  const { jobId } = useParams();

  // --- All data fetching and filtering logic remains unchanged ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const jobData = await api.getJobDetails(jobId);
      const appsData = await api.getApplicationsForJob(jobId);
      setJob(jobData);
      setApplications(appsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let filtered = [...applications];
    if (filters.stage !== "all") {
      filtered = filtered.filter((app) => app.stage === filters.stage);
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.candidate?.name?.toLowerCase().includes(term) ||
          app.candidate?.email?.toLowerCase().includes(term)
      );
    }
    if (filters.appliedDate !== "all") {
      const daysToSubtract = parseInt(filters.appliedDate, 10);
      if (!isNaN(daysToSubtract)) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToSubtract);
        filtered = filtered.filter(
          (app) => new Date(app.appliedAt) >= cutoffDate
        );
      }
    }
    setFilteredApps(filtered);
  }, [applications, filters]);

  const paginatedApps = useMemo(
    () => paginate(filteredApps, currentPage, ITEMS_PER_PAGE),
    [filteredApps, currentPage]
  );
  const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoaderCircle size={48} className="text-blue-500 animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-red-400">
        <p>Error: {error}.</p>
        <Link to="/jobs" className="mt-4 text-blue-400 hover:underline">
          Return to Jobs List
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* --- UI ENHANCEMENT: Redesigned Header --- */}
      <header className="bg-slate-800/80 backdrop-blur-sm shadow-lg border-b border-slate-700 px-6 py-4 flex-shrink-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-400">Applications for</p>
            <h1 className="text-2xl font-bold text-white">{job?.title}</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to={`/jobs/${jobId}`}
              className="flex items-center px-4 py-2 bg-slate-700/50 border border-slate-600 hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Job
            </Link>
            <Link
              to={`/jobs/${jobId}/kanban`}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all text-sm font-bold shadow-lg hover:shadow-indigo-500/40 transform hover:-translate-y-px"
            >
              <LayoutDashboard size={16} className="mr-2" /> Kanban View
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden">
        <aside className="w-1/4 bg-slate-800 shadow-lg border-r border-slate-700 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
            <Filter size={18} className="mr-2 text-blue-400" />
            Filter Applications
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Search by Candidate
              </label>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Name or email..."
                  value={filters.searchTerm}
                  onChange={(e) =>
                    handleFilterChange("searchTerm", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Application Stage
              </label>
              <select
                value={filters.stage}
                onChange={(e) => handleFilterChange("stage", e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white transition appearance-none bg-no-repeat bg-right pr-8"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                }}
              >
                <option value="all">All Stages</option>
                {STAGE_OPTIONS.map((stage) => (
                  <option key={stage} value={stage} className="capitalize">
                    {stage}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Applied Date
              </label>
              <select
                value={filters.appliedDate}
                onChange={(e) =>
                  handleFilterChange("appliedDate", e.target.value)
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white transition appearance-none bg-no-repeat bg-right pr-8"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                }}
              >
                <option value="all">Any Time</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-8 text-center">
            Showing {filteredApps.length} of {applications.length} total
            applications.
          </p>
        </aside>

        <main className="w-3/4 p-6 flex flex-col bg-slate-900">
          {filteredApps.length > 0 ? (
            <>
              {/* --- UI ENHANCEMENT: Added container for stagger animation --- */}
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 },
                  },
                }}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 flex-grow"
              >
                <AnimatePresence>
                  {paginatedApps.map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                </AnimatePresence>
              </motion.div>
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsCount={filteredApps.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
              <Users size={48} className="mb-4" />
              <h3 className="text-xl font-semibold text-white">
                No Applications Found
              </h3>
              <p>No applications match your current filters.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const CandidateAvatar = ({ name }) => {
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  return (
    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white text-lg shrink-0">
      {initial}
    </div>
  );
};

const ApplicationCard = ({ application }) => {
  const { candidate, stage, appliedAt } = application;
  const stageColor = STAGE_COLORS[stage] || STAGE_COLORS.default;

  // --- UI ENHANCEMENT: Variants for staggered animation ---
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
    exit: { y: -20, opacity: 0 },
  };

  return (
    <motion.div
      variants={itemVariants}
      layout
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-5 group hover:shadow-xl hover:border-purple-500 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <CandidateAvatar name={candidate?.name} />
            <div>
              <h3 className="text-lg font-semibold text-white">
                {candidate?.name || "Unknown"}
              </h3>
              <p className="text-sm text-slate-400 -mt-1">
                {candidate?.email || "No email"}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${stageColor}`}
          >
            {stage}
          </span>
        </div>
        <div className="space-y-2 text-sm text-slate-300 border-t border-slate-700 pt-4 mt-4">
          <p className="flex items-center">
            <Calendar size={14} className="mr-2 text-slate-400" /> Applied:{" "}
            {new Date(appliedAt).toLocaleDateString()}
          </p>
          <p className="flex items-center">
            <Hash size={14} className="mr-2 text-slate-400" /> App. ID:{" "}
            {application.id.slice(0, 8)}
          </p>
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <Link
          to={`/candidate/${candidate.id}`}
          className="text-sm font-medium bg-slate-700/80 px-4 py-2 rounded-md text-purple-300 group-hover:bg-purple-500 group-hover:text-white transition-colors"
        >
          View Profile
        </Link>
      </div>
    </motion.div>
  );
};
