/**
 * Paginates an array of items.
 * @param {Array} items - The array of items to paginate.
 * @param {number} currentPage - The current page number (1-based).
 * @param {number} itemsPerPage - The number of items to show per page.
 * @returns {Array} The items for the current page.
 */
export const paginate = (items, currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
};
