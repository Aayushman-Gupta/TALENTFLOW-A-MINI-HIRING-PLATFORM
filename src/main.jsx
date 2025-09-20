import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { seedDatabase } from './services/dataSeeder'; // 1. Import the seeder

// MSW Integration
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const { worker } = await import('./mocks/browser.js');
  return worker.start();
}
enableMocking().then(async () => {

  // check the database and add data ONLY if it's empty.
  await seedDatabase();
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});