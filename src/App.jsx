import React from "react";
import "./App.css";
import LoginPage from "./components/LoginPage";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { DashBoardPage } from "./components/DashBoard";
import JobDetailPage from "./components/jobs/JobDetailPage";
import ApplicationsPage from "./components/applications/ApplicationPage";
import KanbanPage from "./components/kanban/KanbanPage";
import CandidateProfilePage from "./components/candidates/CandidateProfilePage";
import AssessmentBuilderPage from "./components/Assessments/AssessmentsBuilderpage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashBoardPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        <Route
          path="/jobs/:jobId/applications"
          element={<ApplicationsPage />}
        />
        <Route path="/jobs/:jobId/kanban" element={<KanbanPage />} />
        <Route
          path="/candidate/:candidateId"
          element={<CandidateProfilePage />}
        />

        {/* --- NEW ROUTE FOR THE ASSESSMENT BUILDER --- */}
        <Route
          path="/jobs/:jobId/assessment-builder"
          element={<AssessmentBuilderPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;