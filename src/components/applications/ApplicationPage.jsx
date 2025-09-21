import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Filter, Search, Mail, Calendar, Hash, LoaderCircle, Users } from 'lucide-react';
import { paginate } from '../../utils/pagination';
import PaginationControls from '../../utils/PaginationControls';

// --- API Service (no changes) ---
const api = {
  async getJobDetails(jobId) {
    const response = await fetch(`/api/jobs/${jobId}`);
    if (!response.ok) throw new Error('Job not found');
    return response.json();
  },
  async getApplicationsForJob(jobId) {
    const response = await fetch(`/api/applications?jobId=${jobId}`);
    if (!response.ok) throw new Error('Failed to fetch applications');
    return response.json();
  }
};

const STAGE_OPTIONS = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

// --- Main Applications Page Component ---
export default function ApplicationsPage() {
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const [filters, setFilters] = useState({
    stage: 'all',
    searchTerm: '',
    appliedDate: 'all',
  });
  const { jobId } = useParams();

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

  // --- THIS IS THE CORRECTED FILTERING LOGIC ---
  useEffect(() => {
    let filtered = [...applications];

    // Stage Filter
    if (filters.stage !== 'all') {
      filtered = filtered.filter(app => app.stage === filters.stage);
    }

    // Search Term Filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.candidate?.name?.toLowerCase().includes(term) ||
        app.candidate?.email?.toLowerCase().includes(term)
      );
    }

    // Applied Date Filter (Robust Implementation)
    if (filters.appliedDate !== 'all') {
        const daysToSubtract = parseInt(filters.appliedDate, 10);
        // This check ensures we only filter if we have a valid number
        if (!isNaN(daysToSubtract)) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToSubtract);

            filtered = filtered.filter(app => {
                const appDate = new Date(app.appliedAt);
                // Ensure the application date is valid before comparing
                return !isNaN(appDate) && appDate >= cutoffDate;
            });
        }
    }

    setFilteredApps(filtered);
  }, [applications, filters]);

  const paginatedApps = useMemo(() => {
    return paginate(filteredApps, currentPage, ITEMS_PER_PAGE);
  }, [filteredApps, currentPage]);

  const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><LoaderCircle size={48} className="text-blue-500 animate-spin" /></div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-red-400">
        <p>Error: {error}.</p>
        <Link to="/jobs" className="mt-4 text-blue-400 hover:underline">Return to Jobs List</Link>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 shadow-lg border-b border-gray-700 px-6 py-4 flex-shrink-0">
        <Link to={`/jobs/${jobId}`} className="flex items-center text-blue-400 hover:text-blue-300 mb-4 group w-fit">
          <ArrowLeft size={18} className="mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Job Details
        </Link>
        <h1 className="text-2xl font-bold">Applications for: <span className="text-purple-400">{job?.title}</span></h1>
        <p className="text-gray-300 mt-1">Found {filteredApps.length} of {applications.length} total applications.</p>
      </header>

      <div className="flex flex-grow overflow-hidden">
        <aside className="w-1/4 bg-slate-800 shadow-lg border-r border-slate-700 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Filter size={18} className="mr-2 text-blue-400" />
            Filter Applications
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search by Candidate</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Name or email..." value={filters.searchTerm} onChange={(e) => handleFilterChange('searchTerm', e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Application Stage</label>
              <select value={filters.stage} onChange={(e) => handleFilterChange('stage', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white">
                <option value="all">All Stages</option>
                {STAGE_OPTIONS.map(stage => (<option key={stage} value={stage} className="capitalize">{stage}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Applied Date</label>
              <select value={filters.appliedDate} onChange={(e) => handleFilterChange('appliedDate', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white">
                <option value="all">Any Time</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>
          </div>
        </aside>

        <main className="w-3/4 p-6 flex flex-col">
          {filteredApps.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 flex-grow">
                {paginatedApps.map(app => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </div>
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsCount={filteredApps.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <Users size={48} className="mb-4" />
                <h3 className="text-xl font-semibold text-white">No Applications Found</h3>
                <p>No applications match your current filters.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const ApplicationCard = ({ application }) => {
  const { candidate, stage, appliedAt } = application;
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-5 hover:shadow-xl hover:border-purple-500 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{candidate?.name || 'Unknown Candidate'}</h3>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 capitalize">{stage}</span>
        </div>
        <div className="space-y-2 text-sm text-gray-300">
          <p className="flex items-center"><Mail size={14} className="mr-2 text-gray-400" /> {candidate?.email || 'No email'}</p>
          <p className="flex items-center"><Calendar size={14} className="mr-2 text-gray-400" /> Applied: {new Date(appliedAt).toLocaleDateString()}</p>
          <p className="flex items-center"><Hash size={14} className="mr-2 text-gray-400" /> App. ID: {application.id.slice(0, 8)}</p>
        </div>
      </div>
      <div className="mt-5 border-t border-gray-700 pt-4 flex justify-end">
        <button className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">View Profile &rarr;</button>
      </div>
    </div>
  );
};