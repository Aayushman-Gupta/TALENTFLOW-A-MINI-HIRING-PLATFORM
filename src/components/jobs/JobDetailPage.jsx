import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  Clock,
  Edit3,
  Archive,
  Eye,
  ArrowLeft,
  LoaderCircle,
  ArchiveRestore,
  ClipboardPlus,
  Users,
  ClipboardList,
  ClipboardCheck,
  LayoutDashboard,
  TrendingUp,
  Target,
  Calendar,
  Building2,
  Star,
  Award,
  Activity,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import Toast from "./Toast";
import JobModal from "./JobModal";

// --- API Service Functions (using your handlers.js logic) ---
const api = {
  async getJobDetails(jobId) {
    const response = await fetch(`/api/jobs/${jobId}`);
    if (!response.ok) throw new Error("Job not found");
    return response.json();
  },
  async getApplicationsForJob(jobId) {
    const response = await fetch(`/api/applications?jobId=${jobId}`);
    if (!response.ok) return [];
    return response.json();
  },
  async getAssessmentStatusesForJob(jobId) {
    const response = await fetch(`/api/jobs/${jobId}/candidate-assessments`);
    if (!response.ok) return {};
    return response.json();
  },
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

const STAGE_NAMES = {
  applied: "Applied",
  screen: "Screening",
  tech: "Tech Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

// --- Sub-Components for the Enhanced UI ---

const StatsCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
  trend,
  delay = 0,
}) => (
  <div
    style={{
      opacity: 0,
      animation: `fadeInUp 0.6s ease-out ${delay}s forwards`,
    }}
    className="bg-gradient-to-br from-gray-800 to-gray-700 p-5 rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-300 group hover:scale-105 hover:shadow-xl"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center mb-3">
          <div
            className={`p-2.5 rounded-xl ${color} mr-3 group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon size={18} className="text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-300 group-hover:text-gray-200 transition-colors">
            {title}
          </h3>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-white group-hover:text-blue-300 transition-colors">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {trend && (
        <div className="flex items-center text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded-full">
          <TrendingUp size={12} className="mr-1" />
          {trend}
        </div>
      )}
    </div>
  </div>
);

const PipelineChart = ({ pipelineData }) => (
  <div
    style={{
      opacity: 0,
      animation: "fadeInUp 0.6s ease-out 0.4s forwards",
    }}
    className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-white flex items-center">
        <Activity className="mr-3 text-indigo-400" size={24} />
        Candidate Pipeline
      </h3>
      <div className="flex items-center text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
        <Target size={16} className="mr-2" />
        Live Distribution
      </div>
    </div>
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart
          data={pipelineData}
          margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={1} />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity={1} />
              <stop offset="95%" stopColor="#EC4899" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: "linear-gradient(135deg, #1F2937 0%, #111827 100%)",
              borderColor: "#374151",
              borderRadius: "12px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
            }}
          />
          <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const AssessmentChart = ({ stats }) => {
  const data = [
    { name: "Pending", value: stats.pending, color: "#F59E0B" },
    { name: "Completed", value: stats.completed, color: "#10B981" },
  ];
  const total = stats.pending + stats.completed;
  const completionRate =
    total > 0 ? ((stats.completed / total) * 100).toFixed(1) : 0;

  return (
    <div
      style={{
        opacity: 0,
        animation: "fadeInUp 0.6s ease-out 0.5s forwards",
      }}
      className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Award className="mr-2 text-yellow-400" size={20} />
          Assessments
        </h3>
        <div className="text-2xl font-bold text-green-400">
          {completionRate}%
        </div>
      </div>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "linear-gradient(135deg, #1F2937 0%, #111827 100%)",
                borderColor: "#374151",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center space-x-4 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center text-sm">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-gray-300">
              {item.name}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuickActions = ({ job, onEdit, onToggleStatus }) => {
  const actions = [
    {
      link: `/jobs/${job.id}/applications`,
      icon: Eye,
      label: "View Applications",
      color: "bg-blue-500",
      description: "Review all candidate applications",
    },
    {
      link: `/jobs/${job.id}/kanban`,
      icon: LayoutDashboard,
      label: "Kanban Board",
      color: "bg-purple-500",
      description: "Manage hiring pipeline",
    },
    {
      link: `/jobs/${job.id}/assessment-builder`,
      icon: ClipboardPlus,
      label: "Build Assessment",
      color: "bg-green-500",
      description: "Create candidate evaluations",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-300 h-fit">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Target className="mr-3 text-indigo-400" size={24} />
          Quick Actions
        </h3>
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </div>
      <div className="space-y-3 mb-6">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="w-full flex items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-300 group border border-gray-600 hover:border-gray-500 hover:scale-105 hover:shadow-lg"
          >
            <div
              className={`p-3 rounded-xl ${action.color} mr-4 group-hover:scale-110 transition-transform shadow-lg`}
            >
              <action.icon size={18} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors">
                {action.label}
              </div>
              <div className="text-gray-400 text-xs mt-1 group-hover:text-gray-300 transition-colors">
                {action.description}
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="pt-4 border-t border-gray-600 space-y-3">
        <button
          onClick={onEdit}
          className="w-full flex items-center justify-center p-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all duration-300 group hover:scale-105 hover:shadow-xl"
        >
          <Edit3 size={18} className="mr-3 text-white" />
          <span className="text-white font-semibold">Edit Job Details</span>
        </button>
        <button
          onClick={onToggleStatus}
          className={`w-full flex items-center justify-center p-4 rounded-xl transition-all duration-300 group hover:scale-105 hover:shadow-xl ${
            job.status === "active"
              ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          }`}
        >
          {job.status === "active" ? (
            <Archive size={18} className="mr-3 text-white" />
          ) : (
            <ArchiveRestore size={18} className="mr-3 text-white" />
          )}
          <span className="text-white font-semibold">
            {job.status === "active" ? "Archive Job" : "Restore Job"}
          </span>
        </button>
      </div>
    </div>
  );
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
  const [stats, setStats] = useState({
    totalApps: 0,
    pending: 0,
    completed: 0,
  });
  const [pipelineData, setPipelineData] = useState([]);
  const { jobId } = useParams();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [jobData, appsData, statusesData] = await Promise.all([
        api.getJobDetails(jobId),
        api.getApplicationsForJob(jobId),
        api.getAssessmentStatusesForJob(jobId),
      ]);
      setJob(jobData);

      const totalApps = appsData.length;
      const statuses = Object.values(statusesData);
      const pending = statuses.filter((s) => s.status === "pending").length;
      const completed = statuses.filter((s) => s.status === "submitted").length;
      setStats({ totalApps, pending, completed });

      const pipelineDistribution = Object.keys(STAGE_NAMES).map((stage) => ({
        name: STAGE_NAMES[stage],
        count: appsData.filter((app) => app.stage === stage).length,
      }));
      setPipelineData(pipelineDistribution);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      await fetchData();
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

  if (isLoading || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            size={48}
            className="text-indigo-500 animate-spin mx-auto mb-4"
          />
          <p className="text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center text-red-400">
        <div className="text-center bg-gray-800 p-8 rounded-xl border border-red-500/20">
          <p className="text-lg mb-4">Error: {error}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const conversionRate =
    stats.totalApps > 0
      ? ((stats.completed / stats.totalApps) * 100).toFixed(1)
      : 0;

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 font-sans">
        <Toast
          notification={notification}
          onClose={() => setNotification({ ...notification, show: false })}
        />

        <div className="max-w-7xl mx-auto space-y-6">
          <div
            style={{
              opacity: 0,
              animation: "fadeInUp 0.6s ease-out forwards",
            }}
            className="flex items-center justify-between"
          >
            <Link
              to="/dashboard"
              className="flex items-center text-indigo-400 hover:text-indigo-300 group"
            >
              <ArrowLeft
                size={18}
                className="mr-2 transition-transform group-hover:-translate-x-1"
              />
              <span className="font-medium">Back to Dashboard</span>
            </Link>

            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                job.status === "active"
                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                  : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
              }`}
            >
              {job.status === "active" ? "Active" : "Archived"}
            </span>
          </div>

          <div
            style={{
              opacity: 0,
              animation: "fadeInUp 0.6s ease-out 0.1s forwards",
            }}
            className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-2xl border border-indigo-500/20 backdrop-blur-sm"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  {job.title}
                </h1>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center bg-gray-800/80 border border-gray-600/50 px-4 py-2 rounded-full">
                    <MapPin size={16} className="mr-2 text-indigo-400" />
                    <span className="text-gray-200 font-medium">
                      {job.location}
                    </span>
                  </div>
                  <div className="flex items-center bg-gray-800/80 border border-gray-600/50 px-4 py-2 rounded-full">
                    <Building2 size={16} className="mr-2 text-purple-400" />
                    <span className="text-gray-200 font-medium">
                      {job.department}
                    </span>
                  </div>
                  <div className="flex items-center bg-gray-800/80 border border-gray-600/50 px-4 py-2 rounded-full">
                    <Clock size={16} className="mr-2 text-green-400" />
                    <span className="text-gray-200 font-medium">
                      {job.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              icon={Users}
              title="Total Applications"
              value={stats.totalApps}
              subtitle="All time"
              color="bg-blue-500"
              trend="+12%"
              delay={0.1}
            />
            <StatsCard
              icon={ClipboardList}
              title="Pending Assessments"
              value={stats.pending}
              subtitle={`${
                stats.totalApps > 0
                  ? ((stats.pending / stats.totalApps) * 100).toFixed(0)
                  : 0
              }% of total`}
              color="bg-yellow-500"
              delay={0.2}
            />
            <StatsCard
              icon={ClipboardCheck}
              title="Completed Assessments"
              value={stats.completed}
              subtitle={`${conversionRate}% completion rate`}
              color="bg-green-500"
              trend="+8%"
              delay={0.3}
            />
            <StatsCard
              icon={TrendingUp}
              title="Pipeline Health"
              value="Good"
              subtitle="Balanced distribution"
              color="bg-purple-500"
              delay={0.4}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div
              style={{
                opacity: 0,
                animation: "fadeInLeft 0.6s ease-out 0.2s forwards",
              }}
              className="lg:col-span-4"
            >
              <QuickActions
                job={job}
                onEdit={() => setIsEditModalOpen(true)}
                onToggleStatus={handleToggleStatus}
              />
            </div>

            <div className="lg:col-span-5">
              <PipelineChart pipelineData={pipelineData} />
            </div>

            <div className="lg:col-span-3">
              <AssessmentChart stats={stats} />
            </div>
          </div>

          <div
            style={{
              opacity: 0,
              animation: "fadeInUp 0.6s ease-out 0.6s forwards",
            }}
            className="bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-300"
          >
            <div className="flex items-center mb-8">
              <Briefcase className="mr-4 text-indigo-400" size={28} />
              <h2 className="text-2xl font-bold text-white">
                Job Details & Requirements
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full mr-4"></div>
                  Job Description
                </h3>
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-colors">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                    {job.description || "No description provided."}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-4"></div>
                  Requirements & Qualifications
                </h3>
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-colors">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                    {job.requirements || "No requirements listed."}
                  </p>
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
    </>
  );
}
