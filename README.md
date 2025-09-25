# 🌟 TalentFlow – A Mini Hiring Platform

> **A front-end-only hiring management application built with React**  
> Manage Jobs, Candidates, and Assessments with a professional, intuitive UI.  
> Powered by **MSW** (Mock Service Worker) + **Dexie.js** for persistence.

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Core Philosophy](#-core-philosophy)
3. [Tech Stack & Architecture](#-tech-stack--architecture)
4. [Features](#-features)
   - [Jobs Dashboard](#jobs-dashboard-dashboard)
   - [Job Detail Page](#job-detail-page-jobsjobid)
   - [Kanban Board](#kanban-board-jobsjobidkanban)
   - [Candidate Profile Page](#candidate-profile-page-candidatecandidateid)
   - [Assessment Module](#assessment-module)
5. [Setup & Installation](#-setup--installation)
6. [Project Structure](#-project-structure)
7. [API Simulation](#-api-simulation-with-msw)
8. [Comparison with Requirements](#-comparison-with-original-requirements)
9. [Bonus Features](#-bonus-features--novelties)
10. [Future Enhancements](#-future-enhancements)
11. [Contributing](#-contributing)
12. [License](#-license)

---

## 🚀 Project Overview

TalentFlow is a **front-end-only hiring management platform**.  
It enables HR teams to manage the full hiring pipeline:
- Posting job opportunities
- Tracking candidates across stages
- Evaluating them with job-specific assessments

---

## 💡 Core Philosophy

- 100% **browser-based** app (no backend required)
- **MSW** simulates REST API endpoints
- **Dexie.js + IndexedDB** for persistent local storage
- Fully interactive, scalable, and production-ready front-end demo

---

## 🛠️ Tech Stack & Architecture

**Frontend:** React (with hooks, router, component-based UI)  
**API Simulation:** MSW (Mock Service Worker)  
**Database:** Dexie.js (IndexedDB wrapper)  
**UI/UX:** TailwindCSS + Framer Motion  
**Data Seeding:** Faker.js  
**Drag-and-Drop:** dnd-kit  
**Charts:** Recharts  

📌 **Architecture Flow**:
- UI is completely decoupled from the data layer  
- Mock API ensures realistic dev/test environment  
- IndexedDB ensures persistence across sessions  

---

## ✨ Features

### 📊 Jobs Dashboard (`/dashboard`)
- **Global Statistics Header** – Shows total jobs, candidates, applications, hires  
- **Create New Job** – Modal form with validation  
- **Automatic Application Seeding** – Faker.js auto-creates applications  
- **Job List** – Paginated, sortable, draggable job cards  
- **Filtering & Search** – Filter by status, search by title  
- **Drag-and-Drop Reordering** – Order saved to DB  
- **Navigation** – Each job card links to detailed view  

---

### 📌 Job Detail Page (`/jobs/:jobId`)
- **Multi-Column Dashboard Layout**  
- **Candidate Pipeline Chart** – Bar chart of candidates by stage  
- **Assessment Stats Chart** – Donut chart of assessment status  
- **Action Panel** – Quick links: Applications, Kanban, Assessment, Edit, Archive  

---

### 🗂️ Kanban Board (`/jobs/:jobId/kanban`)
- **Stage Columns** – Applied → Screening → Tech → Offer → Hired/Rejected  
- **Draggable Candidate Cards** – Move candidates between stages  
- **Visual Assessment Status** – Pending = ⏳, Submitted = ✅  
- **Constraints**:
  - **Assessment Lock** – Cannot move candidate if pending assessment  
  - **No Backward Moves** – Except to "Rejected" stage  
- **Real-time Sync** – State updates instantly in UI  

---

### 👤 Candidate Profile Page (`/candidate/:candidateId`)
- **Timeline View** – Track candidate’s journey through stages  
- **Assessment Timing Tooltip** – Shows exact start, end, and duration  
- **Assessment Control** – Only enabled during Tech Interview stage  

---

### 📝 Assessment Module
- **Assessment Builder** – Add sections, multiple question types  
- **Live Preview** – Right-side preview of assessment form  
- **Validation Rules** – Required fields, numeric ranges, conditional questions  
- **Automated Status Tracking**:
  - Candidate enters Tech stage → Assessment set to "pending"  
  - On submission → Status updates to "submitted"  

---

## ⚙️ Setup & Installation

```bash
# Clone repo
git clone https://github.com/<your-username>/talentflow.git
cd talentflow

# Install dependencies
npm install

# Start development server
npm run dev
