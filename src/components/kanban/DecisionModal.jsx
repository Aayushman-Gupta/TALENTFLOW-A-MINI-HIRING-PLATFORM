import React from 'react';
import { CheckCircle, XCircle, User } from 'lucide-react';

// A simple animation style for the modal
const modalAnimation = `
  @keyframes scale-in {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .animate-scale-in {
    animation: scale-in 0.2s ease-out forwards;
  }
`;

export function DecisionModal({ isOpen, candidate, onConfirm, onCancel }) {
  if (!isOpen || !candidate) return null;

  return (
    <>
      <style>{modalAnimation}</style>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-sm p-6 text-center transform animate-scale-in">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-slate-700 mb-4">
            <User className="h-6 w-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-medium leading-6 text-slate-100">Final Decision</h3>
          <p className="mt-2 text-sm text-slate-400">
            What is the final status for <span className="font-bold text-white">{candidate.name}</span>?
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={() => onConfirm('hired')}
              className="flex-1 inline-flex justify-center items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Hire
            </button>
            <button
              onClick={() => onConfirm('rejected')}
              className="flex-1 inline-flex justify-center items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
            >
              <XCircle className="mr-2 h-5 w-5" />
              Reject
            </button>
          </div>
           <button
              onClick={onCancel}
              className="mt-4 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
        </div>
      </div>
    </>
  );
}
