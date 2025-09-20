// src/Toast.jsx

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// Helper to map notification type to styles and icon
const notificationConfig = {
  success: {
    icon: <CheckCircle className="w-6 h-6" />,
    borderColor: 'border-green-500',
  },
  error: {
    icon: <XCircle className="w-6 h-6" />,
    borderColor: 'border-red-500',
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6" />,
    borderColor: 'border-yellow-500',
  },
};

export default function Toast({ notification, onClose }) {
  const { show, message, type = 'success' } = notification;
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (show) {
      setIsExiting(false); // Reset exit animation on new toast

      // Set a timer to start the exit animation
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 2500); // Start fading out after 2.5s

      // Set a timer to fully close the component after the animation finishes
      const closeTimer = setTimeout(() => {
        onClose();
      }, 3000); // Total lifespan of 3s

      // Cleanup timers if the component unmounts or a new toast appears
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [show, message, type, onClose]); // Rerun effect if any of these change

  if (!show) {
    return null;
  }

  const config = notificationConfig[type] || notificationConfig.success;

  // Use a transition for the exit animation
  const animationClass = isExiting
    ? 'opacity-0 translate-x-full'
    : 'opacity-100 translate-x-0';

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 w-full max-w-sm transform transition-all duration-500 ease-in-out ${animationClass}`}
    >
      <div
        className={`bg-gray-800 rounded-lg shadow-2xl border-l-4 ${config.borderColor} text-white overflow-hidden`}
        role="alert"
      >
        <div className="p-4 flex items-center">
          <div className="flex-shrink-0 text-2xl">
            {config.icon}
          </div>
          <div className="ms-4">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            type="button"
            className="ms-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-400 p-1.5 inline-flex items-center justify-center h-8 w-8 text-gray-500 hover:text-white hover:bg-gray-700"
            onClick={() => setIsExiting(true)}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>

        {/* Animated Progress Bar */}
        <div className="h-1 bg-white/20">
            <div className={`h-full ${config.borderColor.replace('border-', 'bg-')} animate-progress-bar`}></div>
        </div>

      </div>
    </div>
  );
}