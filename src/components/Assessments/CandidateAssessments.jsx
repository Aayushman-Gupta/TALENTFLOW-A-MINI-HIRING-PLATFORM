import React, { useState, useEffect } from 'react';
import AssessmentRuntime from './AssessmentRuntime';
import { BookOpen, Check, Loader, AlertTriangle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// This component manages the logic for displaying and launching assessments on the candidate profile.
export default function CandidateAssessments({ candidateId, candidateName }) {
  const [applications, setApplications] = useState([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [assessmentStatus, setAssessmentStatus] = useState('loading'); // loading | available | unavailable | submitted
  const [isTakingAssessment, setIsTakingAssessment] = useState(false); // --- Replaces isModalOpen ---
  const [submittedResponses, setSubmittedResponses] = useState(null);
  const [isFetchingApps, setIsFetchingApps] = useState(true);

  // Fetch all applications for this candidate when the component mounts
  useEffect(() => {
    const fetchApplications = async () => {
      setIsFetchingApps(true);
      try {
        const response = await fetch(`/api/applications?candidateId=${candidateId}`);
        if (!response.ok) throw new Error("Failed to fetch applications");

        const data = await response.json();
        setApplications(data);

        // Automatically select the first application if it exists
        if (data.length > 0) {
          setSelectedApplicationId(data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch applications", error);
        setApplications([]); // Ensure it's an empty array on error
      } finally {
        setIsFetchingApps(false);
      }
    };
    fetchApplications();
  }, [candidateId]);

  // Check assessment availability and submission status whenever the selected job changes
  useEffect(() => {
    if (!selectedApplicationId) {
      if (!isFetchingApps && applications.length === 0) {
          setAssessmentStatus('no_apps');
      }
      return;
    };

    const checkStatus = async () => {
        setAssessmentStatus('loading');
        setSubmittedResponses(null);
        const selectedApp = applications.find(app => app.id === selectedApplicationId);
        if (!selectedApp) return;

        try {
            const responseCheck = await fetch(`/api/assessment-responses/${selectedApplicationId}`);
            if (responseCheck.ok) {
                const responseData = await responseCheck.json();
                setSubmittedResponses(responseData.responses);
                setAssessmentStatus('submitted');
                return;
            }

            const assessmentCheck = await fetch(`/api/assessments/${selectedApp.jobId}`);
            if (assessmentCheck.ok) {
                setAssessmentStatus('available');
            } else {
                setAssessmentStatus('unavailable');
            }
        } catch (error) {
            console.error("Error checking assessment status", error);
            setAssessmentStatus('unavailable');
        }
    };
    checkStatus();
  }, [selectedApplicationId, applications, isFetchingApps]);

  const handleAssessmentSubmitted = () => {
      setAssessmentStatus('submitted');
      const selectedApp = applications.find(app => app.id === selectedApplicationId);
      if(selectedApp) {
        fetch(`/api/assessment-responses/${selectedApplicationId}`)
            .then(res => res.json())
            .then(data => setSubmittedResponses(data.responses))
            .catch(err => console.error("Could not refresh responses", err));
      }
  };

  const selectedApp = applications.find(app => app.id === selectedApplicationId);

  // --- NEW: This is the view for the full-page assessment ---
  if (isTakingAssessment && selectedApp) {
    return (
      <AssessmentRuntime
          jobId={selectedApp.jobId}
          applicationId={selectedApplicationId}
          candidateName={candidateName}
          onClose={() => setIsTakingAssessment(false)}
          onSubmitted={handleAssessmentSubmitted}
      />
    );
  }

  // This is the default view shown on the candidate profile
  const renderSelectorContent = () => {
    if (isFetchingApps) {
        return <div className="flex items-center text-slate-400 mt-4"><Loader size={18} className="animate-spin mr-2"/> Loading applications...</div>;
    }

    if (applications.length === 0) {
        return <p className="mt-4 text-slate-500">This candidate has not applied to any jobs yet.</p>;
    }

    let button;
    switch (assessmentStatus) {
      case 'loading':
        button = <div className="w-full mt-4 h-10 bg-slate-700 rounded-lg flex items-center justify-center"><Loader size={18} className="animate-spin text-slate-400"/></div>;
        break;
      case 'available':
        button = <button onClick={() => setIsTakingAssessment(true)} className="w-full mt-4 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-600/40 transform hover:-translate-y-px">Take Assessment</button>;
        break;
      case 'submitted':
        button = <div className="w-full mt-4 text-center bg-green-500/10 text-green-300 font-semibold py-2 px-4 rounded-lg flex items-center justify-center border border-green-500/30"><Check size={18} className="mr-2"/> Assessment Submitted</div>;
        break;
      case 'unavailable':
        button = <button disabled className="w-full mt-4 bg-slate-800 text-slate-500 font-bold py-2 px-4 rounded-lg cursor-not-allowed border border-slate-700">Assessment Not Created</button>;
        break;
      default:
        button = null;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <label htmlFor="job-select" className="block text-sm font-medium text-gray-400 mt-4 mb-2">Select Job Application:</label>
          <div className="relative">
            <select
                id="job-select"
                value={selectedApplicationId}
                onChange={(e) => setSelectedApplicationId(e.target.value)}
                className="appearance-none w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-4 pr-10 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow duration-200"
            >
              {applications.map(app => (
                <option key={app.id} value={app.id}>
                  {app.job?.title || `Application ${app.id.substring(0,4)}`}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
          </div>
          <AnimatePresence>
            <motion.div
                key={assessmentStatus}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
            >
                {button}
            </motion.div>
          </AnimatePresence>
        </motion.div>
    );
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-white flex items-center"><BookOpen className="mr-3 text-indigo-400" />Assessments</h3>

      {renderSelectorContent()}

      <AnimatePresence>
      {assessmentStatus === 'submitted' && submittedResponses && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
              <div className="p-3 bg-slate-900/50 rounded-md border border-slate-700">
                  <h4 className="font-semibold text-slate-300">Submitted Responses:</h4>
                  <pre className="text-xs text-slate-400 bg-slate-800 p-2 rounded mt-2 overflow-auto max-h-40">
                      {JSON.stringify(submittedResponses, null, 2)}
                  </pre>
              </div>
          </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

