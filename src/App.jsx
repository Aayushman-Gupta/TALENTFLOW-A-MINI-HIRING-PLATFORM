import React from 'react'; // <-- ADD THIS LINE
import './App.css';
import LoginPage from './components/LoginPage';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { DashBoardPage } from './components/DashBoard';
import JobDetailPage from './components/jobs/JobDetailPage';
import ApplicationsPage from './components/applications/ApplicationPage';
import KanbanPage from './components/kanban/KanbanPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashBoardPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        <Route path="/jobs/:jobId/applications" element={<ApplicationsPage />} />
        <Route path="/jobs/:jobId/kanban" element={<KanbanPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;