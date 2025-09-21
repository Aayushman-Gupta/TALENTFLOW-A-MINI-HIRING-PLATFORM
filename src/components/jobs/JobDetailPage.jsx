import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Briefcase, Clock } from 'lucide-react';
import {
  Edit3,
  Archive,
  Eye,
  ArrowLeft,
  LoaderCircle,
  ArchiveRestore,
} from "lucide-react";
import JobModal from "./JobModal";
import Toast from "./Toast";

// --- API Service Functions ---
const api = {
  async updateJob(jobId, jobData) {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });
    if (!response.ok) throw new Error("Failed to update job");
    return response.json();
  },
};

export default function JobDetailPage() {
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const { jobId } = useParams();
  const navigate = useNavigate();

  // --- THIS IS THE FUNCTION THAT WAS MISSING ---
  // It fetches the details for this specific job from the API.
  const fetchJob = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error("Job not found");
      }
      const data = await response.json();
      setJob(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  // This hook calls fetchJob() when the component first loads.
  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  // --- All Handler Functions ---
  const handleToggleStatus = async () => {
    if (!job) return;
    const newStatus = job.status === "active" ? "archived" : "active";
    const action = newStatus === "archived" ? "Archived" : "Restored";
    try {
      const updatedJob = await api.updateJob(job.id, { status: newStatus });
      setJob(updatedJob);
      setNotification({
        show: true,
        message: `Job successfully ${action}!`,
        type: "success",
      });
    } catch (err) {
      setNotification({ show: true, message: err.message, type: "error" });
    }
  };

  const handleSaveEdit = async (editedJobData) => {
    try {
      await api.updateJob(jobId, editedJobData);
      await fetchJob();
      setIsEditModalOpen(false);
      setNotification({
        show: true,
        message: "Job updated successfully!",
        type: "success",
      });
    } catch (err) {
      setNotification({ show: true, message: err.message, type: "error" });
    }
  };

  // --- Render Guards ---
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
        <p>Error: {error}. Could not load job details.</p>
        <Link to="/jobs" className="mt-4 text-blue-400 hover:underline">
          Return to Jobs List
        </Link>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
        Job data could not be loaded.
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <Toast
        notification={notification}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <div className="max-w-4xl mx-auto">
        {/* <button onClick={() => navigate('/jobs')} className="flex items-center text-blue-400 hover:text-blue-300 mb-6 group">
          <ArrowLeft size={18} className="mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Jobs List
        </button> */}

        <div className="flex flex-col md:flex-row items-start justify-between mb-8">
          <div>
  <h1 className="text-4xl font-bold text-white">{job.title}</h1>

  {/* IMPROVED: Replaced the simple text line with styled tags */}
  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-gray-300">
    {/* Location Tag */}
    <div className="flex items-center bg-gray-800 border border-gray-700 px-3 py-1 rounded-full text-sm">
      <MapPin size={14} className="mr-2 text-blue-400" />
      <span>{job.location}</span>
    </div>

    {/* Department Tag */}
    <div className="flex items-center bg-gray-800 border border-gray-700 px-3 py-1 rounded-full text-sm">
      <Briefcase size={14} className="mr-2 text-purple-400" />
      <span>{job.department}</span>
    </div>

    {/* Job Type Tag */}
    <div className="flex items-center bg-gray-800 border border-gray-700 px-3 py-1 rounded-full text-sm">
      <Clock size={14} className="mr-2 text-green-400" />
      <span>{job.type}</span>
    </div>
  </div>
</div>
          <span
            className={`mt-4 md:mt-0 px-3 py-1 rounded-full text-sm font-medium ${
              job.status === "active"
                ? "bg-green-500 bg-opacity-20 text-green-300 border border-green-500"
                : "bg-gray-500 bg-opacity-20 text-gray-300 border border-gray-500"
            }`}
          >
            {job.status === "active" ? "Active" : "Archived"}
          </span>
        </div>

        <div className="flex items-center space-x-4 border-y border-gray-700 py-4 mb-8">
          <Link
        to={`/jobs/${job.id}/applications`}
        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Eye size={18} className="mr-2" />
            View Applications
          </Link>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Edit3 size={18} className="mr-2" /> Edit Job
          </button>
          <button
            onClick={handleToggleStatus}
            className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {job.status === "active" ? (
              <Archive size={18} className="mr-2" />
            ) : (
              <ArchiveRestore size={18} className="mr-2" />
            )}
            {job.status === "active" ? "Archive" : "Restore"} Job
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2 mb-4">
                Job Description
              </h2>
              <p className="text-gray-300 whitespace-pre-wrap">
                {job.description || "No description provided."}
              </p>
              <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2 mt-8 mb-4">
                Requirements
              </h2>
              <p className="text-gray-300 whitespace-pre-wrap">
                {job.requirements || "No requirements listed."}
              </p>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit">
            <h3 className="text-lg font-semibold mb-4">Job Overview</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Salary Range</span>
                <span className="font-medium">{job.salary || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Role</span>
                <span className="font-medium">{job.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Applicants</span>
                <span className="font-medium">{job.applicants || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Posted On</span>
                <span className="font-medium">
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <JobModal
        job={job}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        jobRoleOptions={[
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
        ]}
      />
    </div>
  );
}
