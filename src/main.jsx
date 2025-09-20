import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// This function starts the mock service worker
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Now, this import will successfully find the named 'worker' export
  const { worker } = await import('./mocks/browser.js');

  // And this line will no longer cause an error
  return worker.start();
}

// Render the app after the mock server is ready
enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      
      <App />
    </React.StrictMode>
  );
});