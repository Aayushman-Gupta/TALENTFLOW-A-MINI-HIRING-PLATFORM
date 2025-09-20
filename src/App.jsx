import React from 'react'; // <-- ADD THIS LINE
import './App.css';
import LoginPage from './components/LoginPage';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { DashBoardPage } from './components/DashBoard';
import JobDetailPage from './components/jobs/JobDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashBoardPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;