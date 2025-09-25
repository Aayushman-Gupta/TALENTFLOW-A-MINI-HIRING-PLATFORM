import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Clock,
  Briefcase,
  LoaderCircle,
  MapPin,
  Calendar,
  Star,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  FileText,
  MessageSquare,
  ChevronDown,
  Timer,
} from "lucide-react";
import NotesSection from "../notes/NotesSection";
import Note from "../notes/Note";
import CandidateAssessments from "../Assessments/CandidateAssessments";

const api = {
  async getCandidateDetails(candidateId) {
    const response = await fetch(`/api/candidates/${candidateId}`);
    if (!response.ok) throw new Error("Candidate not found");
    return response.json();
  },
  async getJobsForCandidate(candidateId) {
    const response = await fetch(`/api/candidates/${candidateId}/jobs`);
    if (!response.ok) throw new Error("Could not load jobs for candidate");
    return response.json();
  },
  // --- FIX: New API function to get all applications for a candidate ---
  async getApplicationsForCandidate(candidateId) {
    const response = await fetch(
      `/api/applications?candidateId=${candidateId}`
    );
    if (!response.ok)
      throw new Error("Could not load applications for candidate");
    return response.json();
  },
  async getCandidateTimeline(candidateId, jobId) {
    const response = await fetch(
      `/api/candidates/${candidateId}/timeline?jobId=${jobId}`
    );
    if (!response.ok) throw new Error("Could not load timeline");
    return response.json();
  },
  async getNotesForCandidate(candidateId, jobId) {
    const response = await fetch(
      `/api/candidates/${candidateId}/notes?jobId=${jobId}`
    );
    if (!response.ok) throw new Error("Could not load notes");
    return response.json();
  },
  async getAssessmentTiming(candidateId, jobId) {
    const response = await fetch(
      `/api/candidates/${candidateId}/assessment-timing?jobId=${jobId}`
    );
    if (!response.ok) return null;
    return response.json();
  },
};

const STAGE_CONFIG = {
  applied: {
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: FileText,
    label: "Applied",
  },
  screen: {
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    icon: PlayCircle,
    label: "Screening",
  },
  tech: {
    color: "from-purple-500 to-indigo-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    icon: Award,
    label: "Technical Interview",
  },
  offer: {
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    icon: Star,
    label: "Offer Extended",
  },
  hired: {
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    icon: CheckCircle,
    label: "Hired",
  },
  rejected: {
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    icon: XCircle,
    label: "Rejected",
  },
};

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

export default function CandidateProfilePage() {
  const [candidate, setCandidate] = useState(null);
  const [jobs, setJobs] = useState([]);
  // --- FIX: State to hold all applications and the specific one for the selected job ---
  const [applications, setApplications] = useState([]);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timelineLoaded, setTimelineLoaded] = useState(false);
  const { candidateId } = useParams();
  const [assessmentTiming, setAssessmentTiming] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // --- FIX: Fetch applications along with other initial data ---
        const [candidateData, jobsData, applicationsData] = await Promise.all([
          api.getCandidateDetails(candidateId),
          api.getJobsForCandidate(candidateId),
          api.getApplicationsForCandidate(candidateId),
        ]);
        setCandidate(candidateData);
        setJobs(jobsData);
        setApplications(applicationsData);
        if (jobsData.length > 0) {
          const firstJobId = jobsData[0].id;
          setSelectedJobId(firstJobId);
          // --- FIX: Set the current application based on the first job ---
          setCurrentApplication(
            applicationsData.find((app) => app.jobId === firstJobId)
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [candidateId]);

  useEffect(() => {
    if (!selectedJobId) {
      setTimeline([]);
      setNotes([]);
      setAssessmentTiming(null);
      setCurrentApplication(null);
      return;
    }
    // --- FIX: Find and set the current application when the job ID changes ---
    setCurrentApplication(
      applications.find((app) => app.jobId === selectedJobId)
    );

    const fetchJobSpecificData = async () => {
      setTimelineLoaded(false);
      try {
        const [timelineData, notesData, timingData] = await Promise.all([
          api.getCandidateTimeline(candidateId, selectedJobId),
          api.getNotesForCandidate(candidateId, selectedJobId),
          api.getAssessmentTiming(candidateId, selectedJobId),
        ]);
        setTimeline(timelineData);
        setNotes(notesData);
        setAssessmentTiming(timingData);
        setTimeout(() => setTimelineLoaded(true), 300);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchJobSpecificData();
  }, [selectedJobId, candidateId, applications]);

  // --- FIX: `useMemo` now correctly injects the initial "Applied" event ---
  const combinedEvents = useMemo(() => {
    const stageEvents = timeline.map((event) => ({
      ...event,
      type: "stage",
      date: new Date(event.timestamp),
    }));

    const noteEvents = notes.map((note) => ({
      ...note,
      type: "note",
      date: new Date(note.createdAt),
    }));

    let allEvents = [...stageEvents, ...noteEvents];

    // This is the core fix: If we have an application record, create the "Applied" event
    if (currentApplication) {
      allEvents.push({
        type: "stage",
        newStage: "applied",
        timestamp: currentApplication.appliedAt,
        date: new Date(currentApplication.appliedAt),
      });
    }

    // Remove potential duplicates and sort everything by date
    const uniqueEvents = Array.from(
      new Set(allEvents.map((e) => e.date.toISOString()))
    ).map((date) => allEvents.find((e) => e.date.toISOString() === date));

    return uniqueEvents.sort((a, b) => b.date - a.date);
  }, [timeline, notes, currentApplication]);

  const handleNoteAdded = (newNote) => {
    setNotes((prevNotes) => [newNote, ...prevNotes]);
  };

  const handleAssessmentSubmit = async () => {
    if (candidateId && selectedJobId) {
      try {
        const timingData = await api.getAssessmentTiming(
          candidateId,
          selectedJobId
        );
        setAssessmentTiming(timingData);
      } catch (error) {
        console.error("Failed to refresh assessment timing data:", error);
      }
    }
  };

  if (isLoading || !candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoaderCircle size={48} className="text-blue-400 animate-spin" />
          <p className="text-gray-400">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle size={48} className="text-red-400 mx-auto" />
          <p className="text-red-400 text-lg">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stageEventsForCurrentStage = combinedEvents.filter(
    (e) => e.type === "stage"
  );
  const currentStage =
    stageEventsForCurrentStage.length > 0
      ? stageEventsForCurrentStage[0].newStage
      : "applied";
  const stageConfig = STAGE_CONFIG[currentStage] || STAGE_CONFIG.applied;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white font-sans">
      <motion.div
        className="max-w-7xl mx-auto px-6 py-8"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        <motion.div variants={itemVariants}>
          <Link
            to={-1}
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 group transition-all duration-200 hover:bg-blue-400/10 px-3 py-2 rounded-lg"
          >
            <ArrowLeft
              size={18}
              className="mr-2 transition-transform group-hover:-translate-x-1"
            />
            Back
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl border border-gray-600/50 shadow-2xl mb-8"
        >
          {/* Header content... */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.2,
                }}
                className="relative"
              >
                <div
                  className={`w-32 h-32 bg-gradient-to-br ${stageConfig.color} rounded-2xl flex items-center justify-center shadow-2xl text-5xl font-bold`}
                >
                  {candidate.name.charAt(0).toUpperCase()}
                </div>
                <div
                  className={`absolute -bottom-2 -right-2 w-10 h-10 ${stageConfig.bgColor} ${stageConfig.borderColor} border-2 rounded-full flex items-center justify-center backdrop-blur-sm`}
                >
                  <stageConfig.icon
                    size={20}
                    className={`bg-gradient-to-r ${stageConfig.color} bg-clip-text text-transparent`}
                  />
                </div>
              </motion.div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {candidate.name}
                  </h1>
                  <div
                    className={`mt-2 sm:mt-0 inline-flex items-center px-4 py-2 ${stageConfig.bgColor} ${stageConfig.borderColor} border rounded-full`}
                  >
                    <stageConfig.icon size={16} className="mr-2" />
                    <span className="text-sm font-semibold">
                      {stageConfig.label}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-300">
                  <div className="flex items-center space-x-3 bg-gray-700/30 px-4 py-3 rounded-lg backdrop-blur-sm">
                    <Mail size={18} className="text-blue-400 flex-shrink-0" />
                    <span className="truncate">{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center space-x-3 bg-gray-700/30 px-4 py-3 rounded-lg backdrop-blur-sm">
                      <Phone
                        size={18}
                        className="text-green-400 flex-shrink-0"
                      />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                  {candidate.location && (
                    <div className="flex items-center space-x-3 bg-gray-700/30 px-4 py-3 rounded-lg backdrop-blur-sm">
                      <MapPin
                        size={18}
                        className="text-purple-400 flex-shrink-0"
                      />
                      <span>{candidate.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <motion.div
            variants={itemVariants}
            className="xl:col-span-1 space-y-6"
          >
            {/* Left column content (Details, Assessments, Notes)... */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <User size={22} className="mr-3 text-purple-400" />
                Candidate Details
              </h2>
              <div className="space-y-4">
                <DetailItem
                  label="Experience"
                  value={candidate.experience || "Not specified"}
                  icon={Briefcase}
                />
                <DetailItem
                  label="Applied Date"
                  value={
                    currentApplication
                      ? new Date(
                          currentApplication.appliedAt
                        ).toLocaleDateString()
                      : "N/A"
                  }
                  icon={Calendar}
                />
                {candidate.skills && (
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-2">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.split(",").map((skill, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 bg-blue-500/10 text-blue-300 rounded-full text-xs border border-blue-500/20`}
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {candidate && (
              <CandidateAssessments
                candidateId={candidate.id}
                candidateName={candidate.name}
                onAssessmentSubmit={handleAssessmentSubmit}
              />
            )}
            {candidate && selectedJobId && (
              <NotesSection
                candidateId={candidate.id}
                jobId={selectedJobId}
                onNoteAdded={handleNoteAdded}
              />
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="xl:col-span-2">
            {/* Right column content (Timeline)... */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center">
                  <Clock size={24} className="mr-3 text-purple-400" />
                  Application Timeline
                </h2>
                <div className="relative mt-4 sm:mt-0">
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="appearance-none w-full sm:w-auto bg-slate-700/50 border border-slate-600 rounded-lg pl-4 pr-10 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>
              <ComprehensiveTimeline
                events={combinedEvents}
                isLoaded={timelineLoaded}
                assessmentTiming={assessmentTiming}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// --- All helper components (ComprehensiveTimeline, etc.) remain unchanged ---
const ComprehensiveTimeline = ({ events, isLoaded, assessmentTiming }) => {
  // ... same as before
  const STAGE_ORDER = [
    "applied",
    "screen",
    "tech",
    "offer",
    "hired",
    "rejected",
  ];
  const stageEvents = events.filter((e) => e.type === "stage");
  const noteEvents = events.filter((e) => e.type === "note");

  // This logic now works correctly because `stageEvents` is guaranteed to have the "applied" event
  const currentStageEvent = stageEvents.length > 0 ? stageEvents[0] : null;
  const currentStage = currentStageEvent
    ? currentStageEvent.newStage
    : "applied";
  const currentStageIndex = STAGE_ORDER.indexOf(currentStage);

  const completedStagesMap = new Map();
  stageEvents.forEach((event) => {
    // Use the timestamp as part of the key to ensure uniqueness if stages are repeated
    const key = `${event.newStage}-${event.timestamp}`;
    if (!completedStagesMap.has(event.newStage)) {
      completedStagesMap.set(event.newStage, event);
    }
  });

  if (!isLoaded && events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Loading timeline...</p>
      </div>
    );
  }

  if (isLoaded && events.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock size={48} className="text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">
          No application timeline available for this job.
        </p>
      </div>
    );
  }

  const timelineContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 w-0.5 bg-gray-600 h-full"></div>
      <AnimatePresence>
        {isLoaded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-600 origin-top shadow-glow"
          ></motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="space-y-6"
        variants={timelineContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {STAGE_ORDER.map((stage, stageIndex) => {
          const stageConfig = STAGE_CONFIG[stage];
          const stageEvent = completedStagesMap.get(stage);
          const isCurrent = stage === currentStage;
          const isCompleted = stageEvent && stageIndex < currentStageIndex;
          const isUpcoming =
            stageIndex > currentStageIndex && stage !== "rejected";

          if (stage === "rejected" && !isCurrent && !stageEvent) {
            return null;
          }
          return (
            <motion.div
              key={stage}
              variants={itemVariants}
              className="relative flex items-start"
            >
              <StageChangeEvent
                event={{ newStage: stage, timestamp: stageEvent?.timestamp }}
                isCurrent={isCurrent}
                isCompleted={isCompleted || !!stageEvent}
                isUpcoming={isUpcoming}
                stageConfig={stageConfig}
                assessmentTiming={assessmentTiming}
              />
              <div className="ml-6 flex-1">
                <motion.div
                  whileHover={{ scale: isCompleted || isCurrent ? 1.02 : 1 }}
                  className={`bg-gradient-to-r backdrop-blur-sm rounded-xl p-4 shadow-lg transition-all duration-300 transform ${
                    isCurrent
                      ? `from-gray-700/80 to-gray-800/80 ${stageConfig.borderColor} border ring-1 ring-green-500/20 scale-105 shadow-2xl`
                      : isUpcoming
                      ? `from-gray-800/20 to-gray-900/20 border-gray-600/20 border opacity-40`
                      : `from-gray-700/60 to-gray-800/60 ${stageConfig.borderColor} border`
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                      isCurrent
                        ? "text-white"
                        : isUpcoming
                        ? "text-gray-600"
                        : "text-white"
                    }`}
                  >
                    {stageConfig.label}
                  </h3>
                  {stageEvent && (
                    <div
                      className={`flex items-center space-x-2 text-sm ${
                        isUpcoming ? "text-gray-600" : "text-gray-300"
                      }`}
                    >
                      <Calendar size={14} />
                      <span>
                        {new Date(stageEvent.timestamp).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {isUpcoming && (
                    <div className="text-sm text-gray-500">Upcoming stage</div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
        {noteEvents.map((noteEvent) => (
          <motion.div
            key={`note-${noteEvent.id || noteEvent.createdAt}`}
            variants={itemVariants}
            className="relative flex items-start"
          >
            <NoteEvent event={noteEvent} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const StageChangeEvent = ({
  event,
  isCurrent,
  isCompleted,
  isUpcoming,
  stageConfig,
  assessmentTiming,
}) => (
  <div className="relative group">
    <div
      className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-sm transition-all duration-500 ${
        isCurrent
          ? `${stageConfig.bgColor} ${stageConfig.borderColor} border-2 ring-4 ring-green-500/30`
          : isCompleted
          ? `${stageConfig.bgColor} ${stageConfig.borderColor} border-2 shadow-lg`
          : isUpcoming
          ? "bg-gray-700/30 border-gray-600/30 border-2 opacity-40"
          : `${stageConfig.bgColor} ${stageConfig.borderColor} border-2`
      }`}
    >
      <stageConfig.icon
        size={20}
        className={
          isCompleted || isCurrent
            ? `bg-gradient-to-r ${stageConfig.color} bg-clip-text text-transparent`
            : isUpcoming
            ? "text-gray-600"
            : `bg-gradient-to-r ${stageConfig.color} bg-clip-text text-transparent`
        }
      />
      {isCurrent && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
      )}
    </div>
    {event.newStage === "tech" && assessmentTiming && (
      <AssessmentTooltip timing={assessmentTiming} />
    )}
  </div>
);

const NoteEvent = ({ event }) => (
  <>
    <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-sm bg-gray-700/30 border-gray-600/30 border-2">
      <MessageSquare size={20} className="text-gray-400" />
    </div>
    <div className="ml-6 flex-1">
      <Note note={event} />
    </div>
  </>
);

const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-start space-x-4">
    <div className="w-8 h-8 flex items-center justify-center bg-slate-700/50 rounded-lg">
      <Icon size={16} className="text-gray-400 flex-shrink-0" />
    </div>
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-gray-200 font-medium">{value}</p>
    </div>
  </div>
);

const AssessmentTooltip = ({ timing }) => {
  const calculateDuration = (start, end) => {
    if (!start || !end) return "In Progress";
    const durationMs = new Date(end) - new Date(start);
    if (durationMs < 0) return "Invalid";
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
      <div className="flex items-center text-sm font-bold text-slate-200 mb-2">
        <Timer size={16} className="mr-2 text-purple-400" />
        Assessment Timing
      </div>
      <div className="space-y-1 text-xs text-slate-400">
        <p>
          <span className="font-semibold text-slate-300">Started:</span>{" "}
          {new Date(timing.startTime).toLocaleString()}
        </p>
        <p>
          <span className="font-semibold text-slate-300">Ended:</span>{" "}
          {timing.endTime ? new Date(timing.endTime).toLocaleString() : "N/A"}
        </p>
        <p>
          <span className="font-semibold text-slate-300">Duration:</span>{" "}
          {calculateDuration(timing.startTime, timing.endTime)}
        </p>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5px] w-2.5 h-2.5 bg-slate-900 border-b border-r border-slate-700 transform rotate-45"></div>
    </div>
  );
};
