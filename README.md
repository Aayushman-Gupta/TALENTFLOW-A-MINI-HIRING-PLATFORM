# 🌟 TalentFlow – A Mini Hiring Platform

> **A front-end-only hiring management application built with React**  
> Manage Jobs, Candidates, and Assessments with a professional, intuitive UI.  
> Powered by **MSW** (Mock Service Worker) + **Dexie.js** for persistence.

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Core Philosophy](#-core-philosophy)
3. [Tech Stack & Frameworks](#-tech-stack--frameworks-used)
4. [Features](#-features)
   - [Jobs Dashboard](#jobs-dashboard-dashboard)
   - [Job Detail Page](#job-detail-page-jobsjobid)
   - [Kanban Board](#kanban-board-jobsjobidkanban)
   - [Candidate Profile Page](#candidate-profile-page-candidatecandidateid)
   - [Assessment Module](#assessment-module)
5. [Novel Features](#-novel-features)
6. [Setup & Installation](#-setup--installation)
7. [Project Structure](#-project-structure)
8. [API Simulation](#-api-simulation-with-msw)
9. [Comparison with Requirements](#-comparison-with-original-requirements)
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

## 🛠️ Tech Stack & Frameworks Used

### ⚛️ React.js
- **Why:** Modern, component-based architecture that enables reusability and scalability.  
- **How used:**  
  - Built UI components like `JobCard`, `KanbanColumn`, `StatsCard`  
  - State management via `useState`, `useEffect`, `useMemo`, `useCallback`  
  - Routing handled by `react-router-dom`

---

### 🛡️ MSW (Mock Service Worker)
- **Why:** To simulate a real backend during development.  
- **How used:**  
  - Intercepts `fetch` requests and provides mock responses  
  - Introduces **latency (200–1200ms)** and **error rate (5–10%)** for resilience testing  
  - Connected with Dexie to provide **stateful API behavior**

---

### 🗄️ Dexie.js (IndexedDB wrapper)
- **Why:** Persistent, client-side database with rich queries.  
- **How used:**  
  - Stores jobs, candidates, applications, assessments  
  - Provides schema versioning for evolving data models  
  - Ensures persistence across sessions without backend  

---

### 🎭 Faker.js
- **Why:** To generate realistic seed data for prototyping.  
- **How used:**  
  - Auto-populates 25 jobs & 1000+ candidates on first load  
  - Randomized applications for new job postings  

---

### 🎯 dnd-kit
- **Why:** Accessible, lightweight, and flexible drag-and-drop library.  
- **How used:**  
  - Jobs Dashboard → Drag to reorder job cards  
  - Kanban Board → Move candidates across stages  

---

### 📊 Recharts
- **Why:** Declarative React-based charts for dashboards.  
- **How used:**  
  - Bar chart: Candidate distribution across stages  
  - Donut chart: Pending vs. Completed assessments  

---

### 🎨 Framer Motion
- **Why:** Adds smooth, professional animations.  
- **How used:**  
  - Animations for modals, transitions, and list reordering  
  - Enhances perceived performance and polish  

---

### 💅 Tailwind CSS
- **Why:** Utility-first CSS framework for rapid UI development.  
- **How used:**  
  - Consistent design system across all components  
  - Responsive layouts and clean styling  

---

## ✨ Features

### 📊 Jobs Dashboard (`/dashboard`)
- Global Statistics Header (Total Jobs, Candidates, Applications, Hires)  
- Create New Job modal with validation  
- Auto-seeded applications for realism  
- Paginated & sortable job list  
- Search + filter by status  
- Drag-and-drop job reordering (saved in DB)  

---

### 📌 Job Detail Page (`/jobs/:jobId`)
- Multi-column dashboard layout  
- Candidate pipeline bar chart  
- Assessment stats donut chart  
- Action Panel: View Applications, Kanban, Build Assessment, Edit, Archive  

---

### 🗂️ Kanban Board (`/jobs/:jobId/kanban`)
- Stage-based columns (Applied → Screening → Tech → Offer → Hired/Rejected)  
- Drag-and-drop candidate cards  
- Visual indicators for assessments (Pending ⏳, Submitted ✅)  
- Real-time updates synced to Dexie  

---

### 👤 Candidate Profile Page (`/candidate/:candidateId`)
- Timeline of stage progression  
- Assessment timing tooltip (start, end, duration)  
- Assessment button enabled only in Tech Interview stage  

---

### 📝 Assessment Module
- Builder with multiple question types (MCQ, Text, Numeric, File Upload)  
- Live preview of assessment form  
- Validation: required fields, ranges, conditionals  
- Automated status updates:  
  - Enter Tech stage → Pending assessment  
  - Submit assessment → Status = Submitted  

---

## 🌟 Novel Features

Beyond the required features, **extra functionalities** were implemented:  

- **Assessment Lock (Critical Constraint 1)**  
  - Candidate **cannot be moved out of Tech stage if assessment is pending**  
  - Prevents breaking workflow rules  

- **No Backward Moves (Critical Constraint 2)**  
  - Candidates cannot be moved back to previous stages  
  - Only exception: moving to "Rejected"  

- **Automated Workflow Triggers**  
  - Entering Tech Interview stage → Creates pending assessment + starts timer  
  - Assessment submission → Updates candidate & assessment tables instantly  

- **Real-Time UI Sync**  
  - Assessment status updates instantly in UI without refresh  
  - Kanban & Candidate Profile remain consistent  

- **Advanced Dashboards**  
  - Data-rich statistics on dashboard & job detail page  

- **UI/UX Polish**  
  - Smooth animations via Framer Motion  
  - Tooltips for timelines & statuses  
  - Consistent, professional Tailwind design system  

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
