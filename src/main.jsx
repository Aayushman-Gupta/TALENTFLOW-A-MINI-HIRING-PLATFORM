import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { seedDatabase } from './services/dataSeeder';

// MSW Integration
async function enableMocking() {
  // --- THIS IS THE KEY CHANGE ---
  // We are removing the condition that checks for the development environment.
  // This will force MSW to run in your deployed build on Netlify/Vercel.
  // NOTE: This is ONLY for assignments/demos, not for a real production app.

  // if (process.env.NODE_ENV !== 'development') {
  //   return;
  // }

  const { worker } = await import('./mocks/browser.js');

  // We are now starting the worker in all environments.
  // The 'onUnhandledRequest: 'bypass'' option is good practice,
  // as it allows any real network requests (e.g., to load fonts) to pass through.
  return worker.start({
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
    onUnhandledRequest: 'bypass',
  });
}

// The rest of the file remains the same.
enableMocking().then(async () => {
  // check the database and add data ONLY if it's empty.
  await seedDatabase();
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
