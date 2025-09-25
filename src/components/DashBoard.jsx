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
  Check,
  Award,
} from "lucide-react";
// --- (UNCHANGED) ---
import JobModal from "./jobs/JobModal";
import Toast from "./jobs/Toast";
import { paginate } from "../utils/pagination";
import PaginationControls from "../utils/PaginationControls";
// --- (STEP 1: ADD SENSOR IMPORTS) ---
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
import { motion } from "framer-motion";

// --- API Service and Header components remain unchanged ---
const api = {
  async getDashboardStats() {
    const response = await fetch("/api/dashboard/stats");
    if (!response.ok) throw new Error("Failed to fetch dashboard stats");
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

const DashboardHeader = ({ stats }) => (
  <header className="bg-gray-800 shadow-lg border-b border-gray-700 p-6 mb-6 rounded-b-xl">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Talent Flow Dashboard</h1>
        <p className="text-gray-300 mt-1">
          A high-level overview of your hiring operations.
        </p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        icon={Briefcase}
        title="Total Jobs"
        value={stats.totalJobs}
        subtitle={`${stats.activeJobs} Active`}
        color="bg-blue-500"
        delay={0.1}
      />
      <StatsCard
        icon={Users}
        title="Total Candidates"
        value={stats.totalCandidates}
        subtitle="In the talent pool"
        color="bg-purple-500"
        delay={0.2}
      />
      <StatsCard
        icon={FileText}
        title="Total Applications"
        value={stats.totalApplications}
        subtitle="Across all jobs"
        color="bg-yellow-500"
        delay={0.3}
      />
      <StatsCard
        icon={Award}
        title="Candidates Hired"
        value={stats.totalHired}
        subtitle="Successful placements"
        color="bg-green-500"
        delay={0.4}
      />
    </div>
  </header>
);

const StatsCard = ({ icon: Icon, title, value, subtitle, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-gray-900/50 p-5 rounded-lg border border-gray-700/80 flex items-start"
  >
    <div className={`p-3 rounded-lg ${color} mr-4`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  </motion.div>
);

export const DashBoardPage = () => {
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
  const ITEMS_PER_PAGE = 5;
  const navigate = useNavigate();
  const wasDragged = useRef(false);

  // --- (STEP 2: CONFIGURE THE SENSOR) ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 10 pixels before activating a drag
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiFilters = {
        status: filters.status === "all" ? "" : filters.status,
        title: filters.searchTerm,
      };
      const [jobsData, statsData] = await Promise.all([
        api.getJobs(apiFilters),
        api.getDashboardStats(),
      ]);
      setAllJobs(jobsData);
      setGlobalStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

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
    // Always reset after a click attempt
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
    <div className="min-h-screen bg-gray-900">
      <Toast
        notification={notification}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <DashboardHeader stats={globalStats} />
      <div className="flex px-6 pb-6">
        <aside className="w-1/5 bg-slate-800 shadow-lg border border-slate-700 rounded-xl">
          <div className="p-6">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 mb-8 shadow-lg"
            >
              <Plus size={20} />
              <span>Create New Job</span>
            </button>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Filter size={18} className="mr-2 text-blue-400" />
                  Filters
                </h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search Jobs
                </label>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by title..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                      handleFilterChange("searchTerm", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="active">Active Jobs</option>
                  <option value="archived">Archived Jobs</option>
                  <option value="all">All Jobs</option>
                </select>
              </div>
              <button
                onClick={clearFilters}
                className="w-full text-gray-300 hover:text-white py-2 px-4 border border-slate-600 rounded-lg hover:bg-slate-700"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 pl-12 bg-gray-900">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <LoaderCircle size={48} className="text-blue-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96 text-center text-red-400">
              <p>Error: {error}.</p>
            </div>
          ) : allJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="bg-gray-800 rounded-full p-6 mb-4">
                <Briefcase size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No jobs found
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Get started by creating your first job posting or adjust your
                filters.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Create a Job</span>
              </button>
            </div>
          ) : (
            <>
              {/* --- (STEP 3: APPLY THE SENSORS) --- */}
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
                      <div key={job.id} onClick={() => handleCardClick(job.id)}>
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
            </>
          )}
        </main>
      </div>
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

const JobCard = ({ job }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 hover:shadow-xl hover:border-blue-500 hover:scale-[1.02] transform transition-all duration-300 cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <h3 className="text-lg font-semibold text-white">{job.title}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                job.status === "active"
                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                  : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
              }`}
            >
              {job.status === "active" ? "Active" : "Archived"}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-gray-300">
              <Briefcase size={16} className="mr-2 text-purple-400" />
              <span className="text-sm">{job.role || job.department}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <MapPin size={16} className="mr-2 text-green-400" />
              <span className="text-sm">{job.location}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Calendar size={16} className="mr-2 text-yellow-400" />
              <span className="text-sm">
                Created {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
