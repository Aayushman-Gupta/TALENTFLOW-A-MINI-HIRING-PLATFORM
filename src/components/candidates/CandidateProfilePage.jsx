import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
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
  Download,
  ExternalLink,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import "./CandidateProfilePage.css";
import NotesSection from "../notes/NotesSection";
import Note from "../notes/Note";

// --- API Service for this page ---
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

export default function CandidateProfilePage() {
  const [candidate, setCandidate] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timelineLoaded, setTimelineLoaded] = useState(false);
  const { candidateId } = useParams();

  // Initial fetch for candidate details and their associated jobs
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [candidateData, jobsData] = await Promise.all([
          api.getCandidateDetails(candidateId),
          api.getJobsForCandidate(candidateId),
        ]);
        setCandidate(candidateData);
        setJobs(jobsData);
        if (jobsData.length > 0) {
          setSelectedJobId(jobsData[0].id); // Select the first job by default
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [candidateId]);

  // Fetch timeline and notes WHENEVER the selectedJobId changes
  useEffect(() => {
    if (!selectedJobId) {
      setTimeline([]);
      setNotes([]);
      return;
    }

    const fetchTimelineAndNotes = async () => {
      setTimelineLoaded(false);
      try {
        const [timelineData, notesData] = await Promise.all([
          api.getCandidateTimeline(candidateId, selectedJobId),
          api.getNotesForCandidate(candidateId, selectedJobId),
        ]);
        setTimeline(timelineData);
        setNotes(notesData);
        setTimeout(() => setTimelineLoaded(true), 300);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchTimelineAndNotes();
  }, [selectedJobId, candidateId]);

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
    return [...stageEvents, ...noteEvents].sort((a, b) => b.date - a.date);
  }, [timeline, notes]);

  const handleNoteAdded = (newNote) => {
    setNotes((prevNotes) => [newNote, ...prevNotes]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoaderCircle size={48} className="text-blue-400 animate-spin" />
          <p className="text-gray-400 animate-pulse">
            Loading candidate profile...
          </p>
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentStage = timeline.length > 0 ? timeline[0].newStage : "applied";
  const stageConfig = STAGE_CONFIG[currentStage] || STAGE_CONFIG.applied;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
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

        <div className="relative overflow-hidden bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl border border-gray-600/50 shadow-2xl mb-8 animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="relative animate-scale-in">
                <div
                  className={`w-32 h-32 bg-gradient-to-br ${stageConfig.color} rounded-2xl flex items-center justify-center shadow-2xl text-5xl font-bold`}
                >
                  {candidate.name.charAt(0).toUpperCase()}
                </div>
                <div
                  className={`absolute -bottom-2 -right-2 w-10 h-10 ${stageConfig.bgColor} ${stageConfig.borderColor} border-2 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce-in`}
                >
                  <stageConfig.icon
                    size={20}
                    className={`bg-gradient-to-r ${stageConfig.color} bg-clip-text text-transparent`}
                  />
                </div>
              </div>

              <div className="flex-1 animate-slide-in-right">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {candidate.name}
                  </h1>
                  <div
                    className={`mt-2 sm:mt-0 inline-flex items-center px-4 py-2 ${stageConfig.bgColor} ${stageConfig.borderColor} border rounded-full animate-pulse-glow`}
                  >
                    <stageConfig.icon size={16} className="mr-2" />
                    <span className="text-sm font-semibold">
                      {stageConfig.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-300">
                  <div className="flex items-center space-x-3 bg-gray-700/30 px-4 py-3 rounded-lg backdrop-blur-sm animate-slide-in-up delay-100">
                    <Mail size={18} className="text-blue-400 flex-shrink-0" />
                    <span className="truncate">{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center space-x-3 bg-gray-700/30 px-4 py-3 rounded-lg backdrop-blur-sm animate-slide-in-up delay-200">
                      <Phone
                        size={18}
                        className="text-green-400 flex-shrink-0"
                      />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                  {candidate.location && (
                    <div className="flex items-center space-x-3 bg-gray-700/30 px-4 py-3 rounded-lg backdrop-blur-sm animate-slide-in-up delay-300">
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
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-lg animate-slide-in-left">
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
                    candidate.appliedDate
                      ? new Date(candidate.appliedDate).toLocaleDateString()
                      : "Not available"
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
                          className={`px-3 py-1 bg-blue-500/10 text-blue-300 rounded-full text-xs border border-blue-500/20 animate-fade-in delay-${
                            index * 100
                          }`}
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {candidate && selectedJobId && (
              <NotesSection
                candidateId={candidate.id}
                jobId={selectedJobId}
                onNoteAdded={handleNoteAdded}
              />
            )}
          </div>

          <div className="xl:col-span-2">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-lg animate-slide-in-right">
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ComprehensiveTimeline = ({ events, isLoaded }) => {
  const STAGE_ORDER = ["applied", "screen", "tech", "offer", "hired", "rejected"];

  // Separate stage events and note events
  const stageEvents = events.filter(e => e.type === 'stage');
  const noteEvents = events.filter(e => e.type === 'note');

  // Find current stage from the latest stage event
  const currentStageEvent = stageEvents.length > 0 ? stageEvents[0] : null;
  const currentStage = currentStageEvent ? currentStageEvent.newStage : 'applied';
  const currentStageIndex = STAGE_ORDER.indexOf(currentStage);

  // Create map of completed stages with their timestamps
  const completedStagesMap = new Map();
  stageEvents.forEach(event => {
    if (!completedStagesMap.has(event.newStage)) {
      completedStagesMap.set(event.newStage, event);
    }
  });

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock size={48} className="text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">No timeline events recorded for this job.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 w-0.5 bg-gray-600 h-full"></div>
      {isLoaded && (
        <div className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-600 animate-train-extend origin-top shadow-glow"></div>
      )}

      <div className="space-y-6">
        {/* Render all stages in order */}
        {STAGE_ORDER.map((stage, stageIndex) => {
          const stageConfig = STAGE_CONFIG[stage];
          const stageEvent = completedStagesMap.get(stage);
          const isCurrent = stage === currentStage;
          const isCompleted = stageEvent && !isCurrent;
          const isUpcoming = stageIndex > currentStageIndex && stage !== 'rejected';

          // Skip rejected if not the current stage and not completed
          if (stage === 'rejected' && !isCurrent && !isCompleted) {
            return null;
          }

          const animationDelay = isLoaded ? `delay-${(stageIndex + 1) * 200}` : "";

          return (
            <div
              key={stage}
              className={`relative flex items-start ${
                isLoaded ? "animate-station-arrive" : "opacity-0"
              } ${animationDelay}`}
            >
              {/* Stage Timeline Dot */}
              <div
                className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-sm transition-all duration-500 ${
                  isCurrent
                    ? `${stageConfig.bgColor} ${stageConfig.borderColor} border-2 ring-4 ring-green-500/30 animate-pulse`
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

                {/* Current stage indicator */}
                {isCurrent && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800 animate-bounce"></div>
                )}

                {/* Completed stage indicator */}
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-gray-800 timeline-completion-indicator">
                    <CheckCircle size={12} className="text-white absolute top-0 left-0" />
                  </div>
                )}
              </div>

              {/* Stage Content */}
              <div className="ml-6 flex-1">
                <div
                  className={`bg-gradient-to-r backdrop-blur-sm rounded-xl p-4 shadow-lg transition-all duration-500 transform ${
                    isCurrent
                      ? `from-gray-700/80 to-gray-800/80 ${stageConfig.borderColor} border ring-1 ring-green-500/20 scale-105 shadow-2xl`
                      : isUpcoming
                      ? `from-gray-800/20 to-gray-900/20 border-gray-600/20 border opacity-40`
                      : `from-gray-700/60 to-gray-800/60 ${stageConfig.borderColor} border hover:scale-102 hover:shadow-xl`
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                      isCurrent
                        ? "text-white animate-pulse"
                        : isUpcoming
                        ? "text-gray-600"
                        : "text-white"
                    }`}
                  >
                    {stageConfig.label}
                  </h3>

                  {/* Show date for completed/current stages */}
                  {stageEvent && (
                    <div className={`flex items-center space-x-2 text-sm animate-slide-in-up ${
                      isUpcoming ? "text-gray-600" : "text-gray-300"
                    }`}>
                      <Calendar size={14} />
                      <span>{new Date(stageEvent.timestamp).toLocaleString()}</span>
                    </div>
                  )}

                  {/* Show status for upcoming stages */}
                  {isUpcoming && (
                    <div className="text-sm text-gray-500">
                      Upcoming stage
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Render notes interspersed with stages based on chronological order */}
        {noteEvents.map((noteEvent, index) => {
          const animationDelay = isLoaded ? `delay-${(STAGE_ORDER.length + index + 1) * 200}` : "";

          return (
            <div
              key={`note-${noteEvent.id || noteEvent.createdAt}`}
              className={`relative flex items-start ${
                isLoaded ? "animate-station-arrive" : "opacity-0"
              } ${animationDelay}`}
            >
              <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-sm bg-gray-700/30 border-gray-600/30 border-2">
                <MessageSquare size={20} className="text-gray-400" />
              </div>
              <div className="ml-6 flex-1">
                <Note note={noteEvent} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StageChangeEvent = ({ event, allEvents }) => {
  const STAGE_ORDER = [
    "applied",
    "screen",
    "tech",
    "offer",
    "hired",
    "rejected",
  ];
  const stageConfig = STAGE_CONFIG[event.newStage];

  const stageEvents = allEvents.filter((e) => e.type === "stage");
  const currentStageEvent = stageEvents.length > 0 ? stageEvents[0] : null;
  const currentStage = currentStageEvent
    ? currentStageEvent.newStage
    : "applied";
  const currentStageIndex = STAGE_ORDER.indexOf(currentStage);
  const eventStageIndex = STAGE_ORDER.indexOf(event.newStage);

  const isCurrent = event.timestamp === currentStageEvent?.timestamp;
  const isCompleted = eventStageIndex < currentStageIndex;

  return (
    <>
      <div
        className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-sm transition-all duration-500 ${
          isCurrent
            ? `${stageConfig.bgColor} ${stageConfig.borderColor} border-2 ring-4 ring-green-500/30 animate-pulse`
            : isCompleted
            ? `${stageConfig.bgColor} ${stageConfig.borderColor} border-2 shadow-lg`
            : "bg-gray-700/30 border-gray-600/30 border-2 opacity-40"
        }`}
      >
        <stageConfig.icon
          size={20}
          className={
            isCompleted || isCurrent
              ? `bg-gradient-to-r ${stageConfig.color} bg-clip-text text-transparent`
              : "text-gray-600"
          }
        />
        {isCurrent && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800 animate-bounce"></div>
        )}
        {isCompleted && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-gray-800 timeline-completion-indicator">
            <CheckCircle
              size={12}
              className="text-white absolute top-0 left-0"
            />
          </div>
        )}
      </div>
      <div className="ml-6 flex-1">
        <div
          className={`bg-gradient-to-r backdrop-blur-sm rounded-xl p-4 shadow-lg transition-all duration-500 transform ${
            isCurrent
              ? `from-gray-700/80 to-gray-800/80 ${stageConfig.borderColor} border ring-1 ring-green-500/20 scale-105 shadow-2xl`
              : `from-gray-700/60 to-gray-800/60 ${stageConfig.borderColor} border hover:scale-102 hover:shadow-xl`
          }`}
        >
          <h3
            className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
              isCurrent ? "text-white animate-pulse" : "text-white"
            }`}
          >
            {stageConfig.label}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-300 animate-slide-in-up">
            <Calendar size={14} />
            <span>{new Date(event.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </>
  );
};

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
  <div className="flex items-center space-x-3">
    <Icon size={16} className="text-gray-400 flex-shrink-0" />
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-gray-200 font-medium">{value}</p>
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, label, delay = "" }) => {
  <button
    className={`w-full flex items-center space-x-3 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all duration-200 group border border-gray-600/30 hover:border-blue-500/30 animate-slide-in-up ${delay}`}
  >
    <Icon
      size={16}
      className="text-gray-400 group-hover:text-blue-400 transition-colors"
    />
    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
      {label}
    </span>
  </button>
} ;
