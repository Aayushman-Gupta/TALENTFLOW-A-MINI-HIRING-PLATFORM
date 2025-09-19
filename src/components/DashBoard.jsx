import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Archive, ArchiveRestore, Search, Filter, Briefcase, Calendar, Tag, MapPin, X } from 'lucide-react';

export const DashBoardPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [filters, setFilters] = useState({
    jobRole: '',
    status: 'active',
    searchTerm: ''
  });

  const jobRoleOptions = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Product Manager',
    'UI/UX Designer',
    'QA Engineer',
    'Mobile Developer',
    'Data Analyst',
    'Software Architect',
    'Technical Lead',
    'Business Analyst',
    'Marketing Manager',
    'Sales Executive',
    'HR Specialist',
    'Content Writer',
    'Graphic Designer'
  ];

  useEffect(() => {
    let filtered = jobs;

    if (filters.jobRole) {
      filtered = filtered.filter(job => job.role === filters.jobRole);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    if (filters.searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        job.role.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, filters]);

  const handleCreateJob = (jobData) => {
    const newJob = {
      id: Date.now().toString(),
      ...jobData,
      status: 'active',
      createdAt: new Date().toISOString(),
      applicants: 0
    };
    setJobs([...jobs, newJob]);
    setIsCreateModalOpen(false);
  };

  const handleEditJob = (jobData) => {
    setJobs(jobs.map(job =>
      job.id === jobData.id ? { ...job, ...jobData } : job
    ));
    setEditingJob(null);
  };

  const toggleJobStatus = (jobId) => {
    setJobs(jobs.map(job =>
      job.id === jobId
        ? { ...job, status: job.status === 'active' ? 'archived' : 'active' }
        : job
    ));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      jobRole: '',
      status: 'active',
      searchTerm: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Jobs Dashboard</h1>
              <p className="text-gray-300 mt-1">Manage job postings and track applications</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-600 bg-opacity-20 px-3 py-2 rounded-lg border border-purple-500">
                <span className="text-purple-300 font-medium">{filteredJobs.length} Jobs</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar - Filters (20% width) - Dark Blue Theme */}
        <aside className="w-1/5 bg-slate-800 shadow-lg border-r border-slate-700 min-h-screen">
          <div className="p-6">
            {/* Create Job Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 mb-8 shadow-lg"
            >
              <Plus size={20} />
              <span>Create New Job</span>
            </button>

            {/* Filters Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Filter size={18} className="mr-2 text-blue-400" />
                  Filters
                </h3>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search Jobs
                </label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title, role, or department..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Job Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Role
                </label>
                <select
                  value={filters.jobRole}
                  onChange={(e) => handleFilterChange('jobRole', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  <option value="">All Roles</option>
                  {jobRoleOptions.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  <option value="active">Active Jobs</option>
                  <option value="archived">Archived Jobs</option>
                  <option value="all">All Jobs</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full text-gray-300 hover:text-white py-2 px-4 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors duration-200"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Right Main Content (80% width) - Dark Gray Theme */}
        <main className="flex-1 p-6 bg-gray-900">
          {filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="bg-gray-800 rounded-full p-6 mb-4">
                <Briefcase size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No jobs found
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                {jobs.length === 0
                  ? "Get started by creating your first job posting to attract top talent."
                  : "No jobs match your current filters. Try adjusting your search criteria."
                }
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-lg"
              >
                <Plus size={20} />
                <span>Create Your First Job</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">
                  {filters.status === 'active' ? 'Active Jobs' :
                   filters.status === 'archived' ? 'Archived Jobs' : 'All Jobs'}
                  <span className="ml-2 text-gray-400">({filteredJobs.length})</span>
                </h2>
              </div>

              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={setEditingJob}
                  onToggleStatus={toggleJobStatus}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create/Edit Job Modal */}
      {(isCreateModalOpen || editingJob) && (
        <JobModal
          job={editingJob}
          isOpen={isCreateModalOpen || !!editingJob}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingJob(null);
          }}
          onSave={editingJob ? handleEditJob : handleCreateJob}
          jobRoleOptions={jobRoleOptions}
        />
      )}
    </div>
  );
};

const JobCard = ({ job, onEdit, onToggleStatus }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 hover:shadow-xl hover:border-gray-600 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <h3 className="text-lg font-semibold text-white">{job.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              job.status === 'active'
                ? 'bg-green-500 bg-opacity-20 text-green-300 border border-green-500'
                : 'bg-gray-500 bg-opacity-20 text-gray-300 border border-gray-500'
            }`}>
              {job.status === 'active' ? 'Active' : 'Archived'}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-300">
              <Briefcase size={16} className="mr-2 text-purple-400" />
              <span className="text-sm">{job.role}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Tag size={16} className="mr-2 text-blue-400" />
              <span className="text-sm">{job.department}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <MapPin size={16} className="mr-2 text-green-400" />
              <span className="text-sm">{job.location}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Calendar size={16} className="mr-2 text-yellow-400" />
              <span className="text-sm">Created {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-300">
              <strong className="text-white">{job.applicants}</strong> applicants
            </span>
            <span className="text-gray-300">
              <strong className="text-white">{job.type}</strong>
            </span>
            <span className="text-gray-300">
              <strong className="text-purple-400">{job.salary}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onEdit(job)}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500 hover:bg-opacity-20 rounded-lg transition-colors duration-200"
            title="Edit Job"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={() => onToggleStatus(job.id)}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              job.status === 'active'
                ? 'text-gray-400 hover:text-orange-400 hover:bg-orange-500 hover:bg-opacity-20'
                : 'text-gray-400 hover:text-green-400 hover:bg-green-500 hover:bg-opacity-20'
            }`}
            title={job.status === 'active' ? 'Archive Job' : 'Restore Job'}
          >
            {job.status === 'active' ? <Archive size={18} /> : <ArchiveRestore size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

const JobModal = ({ job, isOpen, onClose, onSave, jobRoleOptions }) => {
  const [formData, setFormData] = useState({
    title: '',
    role: '',
    department: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: '',
    ...job
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.role || !formData.department || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {job ? 'Edit Job' : 'Create New Job'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
                placeholder="e.g. Senior Frontend Developer"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Job Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
                required
              >
                <option value="">Select Role</option>
                {jobRoleOptions.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Department *
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
                placeholder="e.g. Engineering"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
                placeholder="e.g. San Francisco, CA"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Employment Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Salary Range
              </label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => handleChange('salary', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
                placeholder="e.g. $80,000 - $120,000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Job Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
              placeholder="Describe the role, responsibilities, and what you're looking for..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Requirements
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => handleChange('requirements', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
              placeholder="List the required skills, experience, and qualifications..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 border border-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg"
            >
              {job ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoardPage;