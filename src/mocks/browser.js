import { setupWorker } from 'msw/browser';
import { handlers } from './handlers.js'; // Make sure this path points to your handlers file
import { dashboardHandlers } from './dashboardHandlers'

// // This configures a Service Worker with your defined API handlers.
// // It creates and exports the 'worker' constant that main.jsx needs.
export const worker = setupWorker(...handlers,...dashboardHandlers);