// src/JobModal.jsx

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// This is the exact same modal component, now in its own file.
export default function JobModal({ job, isOpen, onClose, onSave, jobRoleOptions }) {
  // useEffect is used to reset the form data whenever the 'job' prop changes
  useEffect(() => {
    if (job) {
      setFormData({ ...job });
    } else {
      // Reset to default for creating a new job
      setFormData({
        title: '', role: '', department: '', location: '', type: 'Full-time', salary: '',
        description: '', requirements: ''
      });
    }
  }, [job, isOpen]);

  const [formData, setFormData] = useState({});

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
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200" title="Close"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Job Title *</label><input type="text" value={formData.title || ''} onChange={(e) => handleChange('title', e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white" required /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Job Role *</label><select value={formData.role || ''} onChange={(e) => handleChange('role', e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white" required><option value="">Select Role</option>{jobRoleOptions.map(role => (<option key={role} value={role}>{role}</option>))}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-sm font-medium text-gray-300 mb-1">Department *</label><input type="text" value={formData.department || ''} onChange={(e) => handleChange('department', e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white" required /></div>
             <div><label className="block text-sm font-medium text-gray-300 mb-1">Location *</label><input type="text" value={formData.location || ''} onChange={(e) => handleChange('location', e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white" required /></div>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Job Description</label>
            <textarea value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} rows={4} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Requirements</label>
            <textarea value={formData.requirements || ''} onChange={(e) => handleChange('requirements', e.target.value)} rows={3} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white" />
          </div>
          <div className="flex justify-end space-x-3 pt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600">Cancel</button>
            <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg">{job ? 'Update Job' : 'Create Job'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}