import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Briefcase,
  Calendar,
  MapPin,
  LoaderCircle,
} from "lucide-react";
import JobModal from "./jobs/JobModal";
import Toast from "./jobs/Toast";
import { paginate } from "../utils/pagination";
import PaginationControls from "../utils/PaginationControls";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableJobCard } from "./jobs/SortableJobCard";

// --- API Service Functions (Assuming these are defined elsewhere) ---
const api = {

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

// --- Main Dashboard Component ---
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
  const ITEMS_PER_PAGE = 5;

  const navigate = useNavigate();
  const wasDragged = useRef(false);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiFilters = {
        status: filters.status === "all" ? "" : filters.status,
        title: filters.searchTerm,
      };
      const data = await api.getJobs(apiFilters);
      setAllJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

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
      setAllJobs(newJobsOrder); // Optimistic update

      try {
        const orderedIds = newJobsOrder.map((job) => job.id);
        await api.reorderJobs(orderedIds);
        setNotification({
          show: true,
          message: "Job order saved!",
          type: "success",
        });
      } catch (err) {
        setAllJobs(originalJobs); // Rollback on failure
        setNotification({ show: true, message: err.message, type: "error" });
      }
    }
  };

  const handleCardClick = (jobId) => {
    if (!wasDragged.current) {
      navigate(`/jobs/${jobId}`);
    }
    // Reset for the next interaction
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
      fetchJobs();
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
    "Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer",
    "Data Scientist", "Product Manager", "UI/UX Designer", "QA Engineer", "Mobile Developer",
    "Data Analyst", "Software Architect", "Technical Lead", "Business Analyst",
    "Marketing Manager", "Sales Executive", "HR Specialist", "Content Writer", "Graphic Designer",
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <Toast
        notification={notification}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Jobs Dashboard</h1>
              <p className="text-gray-300 mt-1">
                Manage job postings and track applications
              </p>
            </div>
            <div className="bg-purple-600 bg-opacity-20 px-3 py-2 rounded-lg border border-purple-500">
              <span className="text-purple-300 font-medium">
                {allJobs.length} Jobs Found
              </span>
            </div>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="w-1/5 bg-slate-800 shadow-lg border-r border-slate-700 min-h-screen">
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

        <main className="flex-1 p-6 bg-gray-900">
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
              <DndContext
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

// --- MODIFIED & SIMPLIFIED JobCard Component ---
const JobCard = ({ job }) => {
  // const navigate = useNavigate();
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 hover:shadow-xl hover:border-blue-500 hover:scale-[1.02] transform transition-all duration-300 cursor-pointer"

    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <h3 className="text-lg font-semibold text-white">{job.title}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                job.status === "active"
                  ? "bg-green-500 bg-opacity-20 text-green-300 border border-green-500"
                  : "bg-gray-500 bg-opacity-20 text-gray-300 border border-gray-500"
              }`}
            >
              {job.status === "active" ? "Active" : "Archived"}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-gray-300">
              <Briefcase size={16} className="mr-2 text-purple-400" />
              <span className="text-sm">{job.role}</span>
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

export default DashBoardPage;