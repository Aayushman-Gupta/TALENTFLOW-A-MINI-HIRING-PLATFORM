import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  itemsCount,
  itemsPerPage,
}) {
  // Return null if there's only one page or no items, as controls aren't needed.
  if (totalPages <= 1) {
    return null;
  }

  // Calculate the range of items being shown on the current page.
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, itemsCount);

  return (
    <div className="mt-8 flex flex-col items-center space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-8 text-gray-400 text-sm">

      {/* Button Group */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center px-3 py-2 font-medium text-white bg-gray-800 border border-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" />
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center px-3 py-2 font-medium text-white bg-gray-800 border border-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
        >
          Next
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
}
