import React from 'react'; // <-- ADD THIS LINE
import './App.css';
import LoginPage from './components/LoginPage';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { DashBoardPage } from './components/DashBoard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashBoardPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;