import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  ExternalLink
} from 'lucide-react';
import './CandidateProfilePage.css'; // Import the CSS animations
import NotesSection from '../notes/NotesSection';

// --- API Service for this page ---
const api = {
  async getCandidateDetails(candidateId) {
    const response = await fetch(`/api/candidates/${candidateId}`);
    if (!response.ok) throw new Error('Candidate not found');
    return response.json();
  },
  async getCandidateTimeline(candidateId) {
    const response = await fetch(`/api/candidates/${candidateId}/timeline`);
    if (!response.ok) throw new Error('Could not load timeline');
    return response.json();
  }
};

// Stage configurations for better visual representation
const STAGE_CONFIG = {
  applied: {
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: FileText,
    label: 'Applied'
  },
  screen: {
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    icon: PlayCircle,
    label: 'Screening'
  },
  tech: {
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    icon: Award,
    label: 'Technical Interview'
  },
  offer: {
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    icon: Star,
    label: 'Offer Extended'
  },
  hired: {
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: CheckCircle,
    label: 'Hired'
  },
  rejected: {
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: XCircle,
    label: 'Rejected'
  }
};

export default function CandidateProfilePage() {
  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timelineLoaded, setTimelineLoaded] = useState(false);
  const { candidateId } = useParams();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [candidateData, timelineData] = await Promise.all([
        api.getCandidateDetails(candidateId),
        api.getCandidateTimeline(candidateId),
      ]);
      setCandidate(candidateData);
      setTimeline(timelineData);

      // Trigger timeline animation after a short delay
      setTimeout(() => {
        setTimelineLoaded(true);
      }, 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoaderCircle size={48} className="text-blue-400 animate-spin" />
          <p className="text-gray-400 animate-pulse">Loading candidate profile...</p>
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
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentStage = timeline.length > 0 ? timeline[0].newStage : 'applied';
  const stageConfig = STAGE_CONFIG[currentStage] || STAGE_CONFIG.applied;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Navigation */}
        <Link
          to={-1}
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 group transition-all duration-200 hover:bg-blue-400/10 px-3 py-2 rounded-lg"
        >
          <ArrowLeft size={18} className="mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Applications
        </Link>

        {/* Enhanced Profile Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl border border-gray-600/50 shadow-2xl mb-8 animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Avatar */}
              <div className="relative animate-scale-in">
                <div className={`w-32 h-32 bg-gradient-to-br ${stageConfig.color} rounded-2xl flex items-center justify-center shadow-2xl text-5xl font-bold`}>
                  {candidate.name.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute -bottom-2 -right-2 w-10 h-10 ${stageConfig.bgColor} ${stageConfig.borderColor} border-2 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce-in`}>
                  <stageConfig.icon size={20} className={`bg-gradient-to-r ${stageConfig.color} bg-clip-text text-transparent`} />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 animate-slide-in-right">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {candidate.name}
                  </h1>
                  <div className={`mt-2 sm:mt-0 inline-flex items-center px-4 py-2 ${stageConfig.bgColor} ${stageConfig.borderColor} border rounded-full animate-pulse-glow`}>
                    <stageConfig.icon size={16} className="mr-2" />
                    <span className="text-sm font-semibold">{stageConfig.label}</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-300">
                  <div className="flex items-center space-x-3 bg-gray-700/30 px-4 py-3 rounded-lg backdrop-blur-sm animate-slide-in-up delay-100">
                    <Mail size={18} className="text-blue-400 flex-shrink-0" />
                    <span className="truncate">{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center space-x-3 bg-gray-700/30 px-4 py-3 rounded-lg backdrop-blur-sm animate-slide-in-up delay-200">
                      <Phone size={18} className="text-green-400 flex-shrink-0" />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                  {candidate.location && (
                    <div className="flex items-center space-x-3 bg-gray-700/30 px-4 py-3 rounded-lg backdrop-blur-sm animate-slide-in-up delay-300">
                      <MapPin size={18} className="text-purple-400 flex-shrink-0" />
                      <span>{candidate.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column: Candidate Details */}
          <div className="xl:col-span-1 space-y-6">
            {/* Details Card */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-lg animate-slide-in-left">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <User size={22} className="mr-3 text-purple-400" />
                Candidate Details
              </h2>
              <div className="space-y-4">
                <DetailItem
                  label="Experience"
                  value={candidate.experience || 'Not specified'}
                  icon={Briefcase}
                />
                <DetailItem
                  label="Applied Date"
                  value={candidate.appliedDate ? new Date(candidate.appliedDate).toLocaleDateString() : 'Not available'}
                  icon={Calendar}
                />
                {candidate.skills && (
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.split(',').map((skill, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 bg-blue-500/10 text-blue-300 rounded-full text-xs border border-blue-500/20 animate-fade-in delay-${index * 100}`}
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            {/* <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-lg animate-slide-in-left delay-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Quick Actions</h3>
              <div className="space-y-3">
                <ActionButton icon={Download} label="Download Resume" delay="delay-100" />
                <ActionButton icon={ExternalLink} label="View Portfolio" delay="delay-200" />
                <ActionButton icon={Mail} label="Send Email" delay="delay-300" />
              </div>
            </div> */}

            {candidate && <NotesSection candidateId={candidate.id} />}
          </div>

          {/* Right Column: Timeline */}
          <div className="xl:col-span-2">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-lg animate-slide-in-right">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Clock size={24} className="mr-3 text-purple-400" />
                Application Timeline
              </h2>

              <ComprehensiveTimeline timeline={timeline} currentStage={currentStage} isLoaded={timelineLoaded} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Timeline Component with train-like animations
const ComprehensiveTimeline = ({ timeline, currentStage, isLoaded }) => {
  const STAGE_ORDER = ["applied", "screen", "tech", "offer", "hired", "rejected"];

  // Create a map of completed stages from timeline
  const completedStages = new Map();
  timeline.forEach(event => {
    if (!completedStages.has(event.newStage)) {
      completedStages.set(event.newStage, {
        timestamp: event.timestamp,
        notes: event.notes
      });
    }
  });

  // Find the maximum/latest stage reached based on STAGE_ORDER and timeline data
  const reachedStages = Array.from(completedStages.keys());
  const maxStageIndex = Math.max(...reachedStages.map(stage => STAGE_ORDER.indexOf(stage)));
  const actualCurrentStage = STAGE_ORDER[maxStageIndex];
  const currentStageIndex = maxStageIndex;

  if (timeline.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock size={48} className="text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">No timeline events recorded.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Animated Timeline Line */}
      <div className="absolute left-6 top-0 w-0.5 bg-gray-600 h-full"></div>
      {isLoaded && (
        <div className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-600 animate-train-extend origin-top shadow-glow"></div>
      )}

      <div className="space-y-6">
        {STAGE_ORDER.map((stage, index) => {
          const stageConfig = STAGE_CONFIG[stage];
          const stageData = completedStages.get(stage);
          const isCurrent = stage === actualCurrentStage; // Use actualCurrentStage instead of currentStage
          const isCompleted = stageData && index < currentStageIndex; // Only stages before current are completed
          const isUpcoming = index > currentStageIndex;
          const StageIcon = stageConfig.icon;

          // Calculate animation delay based on stage position
          const animationDelay = isLoaded ? `delay-${(index + 1) * 200}` : '';

          return (
            <div key={stage} className={`relative flex items-start ${isLoaded ? 'animate-station-arrive' : 'opacity-0'} ${animationDelay}`}>
              {/* Timeline Dot with enhanced animations */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-sm transition-all duration-500 ${
                isCurrent
                  ? `${stageConfig.bgColor} ${stageConfig.borderColor} border-2 ring-4 ring-green-500/30 animate-pulse`
                  : isUpcoming
                    ? 'bg-gray-700/30 border-gray-600/30 border-2 opacity-40'
                    : `${stageConfig.bgColor} ${stageConfig.borderColor} border-2 shadow-lg`
              }`}>
                <StageIcon size={20} className={
                  isCurrent
                    ? `bg-gradient-to-r ${stageConfig.color} bg-clip-text text-transparent`
                    : isUpcoming
                      ? 'text-gray-600'
                      : `bg-gradient-to-r ${stageConfig.color} bg-clip-text text-transparent`
                } />

                {/* Animated current stage indicator */}
                {isCurrent && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800 animate-bounce"></div>
                )}

                {/* Completion checkmark animation */}
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-gray-800 animate-pulse timeline-completion-indicator">
                    <CheckCircle size={12} className="text-white absolute top-0 left-0" />
                  </div>
                )}
              </div>

              {/* Content with enhanced entrance animations */}
              <div className="ml-6 flex-1">
                <div className={`bg-gradient-to-r backdrop-blur-sm rounded-xl p-4 shadow-lg transition-all duration-500 transform ${
                  isCurrent
                    ? `from-gray-700/80 to-gray-800/80 ${stageConfig.borderColor} border ring-1 ring-green-500/20 scale-105 shadow-2xl`
                    : isUpcoming
                      ? 'from-gray-800/20 to-gray-900/20 border-gray-600/20 border opacity-40'
                      : `from-gray-700/60 to-gray-800/60 ${stageConfig.borderColor} border hover:scale-102 hover:shadow-xl`
                }`}>

                  <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                    isUpcoming ? 'text-gray-600' : isCurrent ? 'text-white animate-pulse' : 'text-white'
                  }`}>
                    {stageConfig.label}
                    {isCurrent && <span className="ml-2 text-green-400 animate-bounce">●</span>}
                  </h3>

                  {/* Show date for completed stages with slide animation */}
                  {stageData && (
                    <div className="flex items-center space-x-2 text-sm text-gray-300 animate-slide-in-up">
                      <Calendar size={14} />
                      {/* THIS IS THE ONLY CHANGE: Displaying date and time */}
                      <span>{new Date(stageData.timestamp).toLocaleString()}</span>
                    </div>
                  )}

                  {/* Progress indicator for current stage */}
                  {isCurrent && (
                    <div className="mt-2 w-full bg-gray-600/30 rounded-full h-2 overflow-hidden">
                      <div className="h-full timeline-progress-bar rounded-full w-3/4"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Detail Item Component
const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-center space-x-3">
    <Icon size={16} className="text-gray-400 flex-shrink-0" />
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-gray-200 font-medium">{value}</p>
    </div>
  </div>
);

// Enhanced Action Button Component
const ActionButton = ({ icon: Icon, label, delay = "" }) => (
  <button className={`w-full flex items-center space-x-3 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all duration-200 group border border-gray-600/30 hover:border-blue-500/30 animate-slide-in-up ${delay}`}>
    <Icon size={16} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>
  </button>
);

