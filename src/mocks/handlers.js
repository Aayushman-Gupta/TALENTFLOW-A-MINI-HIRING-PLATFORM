import { http, HttpResponse } from "msw";
import { db } from "../services/database";
import { faker } from "@faker-js/faker";

// Define teamMembers directly in this file to avoid import issues
const teamMembers = [
  {
    id: "user-1",
    name: "Sarah Johnson",
    role: "HR Manager",
    email: "sarah@company.com",
  },
  {
    id: "user-2",
    name: "Mike Chen",
    role: "Technical Lead",
    email: "mike@company.com",
  },
  {
    id: "user-3",
    name: "Lisa Rodriguez",
    role: "Recruiter",
    email: "lisa@company.com",
  },
  {
    id: "user-4",
    name: "David Kim",
    role: "Engineering Manager",
    email: "david@company.com",
  },
  {
    id: "user-5",
    name: "Emily Davis",
    role: "Senior Developer",
    email: "emily@company.com",
  },
  {
    id: "user-6",
    name: "Alex Thompson",
    role: "Product Manager",
    email: "alex@company.com",
  },
  {
    id: "user-7",
    name: "Jennifer Lee",
    role: "UX Designer",
    email: "jennifer@company.com",
  },
  {
    id: "user-8",
    name: "Robert Wilson",
    role: "DevOps Engineer",
    email: "robert@company.com",
  },
];

// Helper to simulate realistic network latency
const simulateNetwork = async () => {
  const delay = Math.random() * 800 + 200; // 200ms - 1000ms delay
  await new Promise((res) => setTimeout(res, delay));
};

export const handlers = [
  http.get("/api/jobs", async ({ request }) => {
    await simulateNetwork();
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const titleSearch = url.searchParams.get("title");
    try {
      let query = db.jobs.orderBy("order");
      if (status) {
        query = query.filter((job) => job.status === status);
      }
      let jobs = await query.toArray();
      if (titleSearch) {
        const searchTerm = titleSearch.toLowerCase();
        jobs = jobs.filter((job) =>
          job.title.toLowerCase().includes(searchTerm)
        );
      }
      return HttpResponse.json(jobs);
    } catch (error) {
      console.error("MSW Handler Error (GET /api/jobs):", error);
      return HttpResponse.json(
        { message: "Failed to access database" },
        { status: 500 }
      );
    }
  }),

  http.post("/api/jobs", async ({ request }) => {
    await simulateNetwork();
    try {
      const newJobData = await request.json();
      const jobCount = await db.jobs.count();

      // Step 1: Create the new job as before
      const newJob = {
        id: crypto.randomUUID(),
        status: "active",
        order: jobCount + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...newJobData,
      };
      await db.jobs.add(newJob);

      // --- NEW LOGIC START ---
      // Step 2: Automatically create applications for this new job
      const allCandidates = await db.candidates.toArray();

      if (allCandidates.length > 0) {
        const numberOfApplications = faker.number.int({ min: 20, max: 50 }); // Assign 5 to 50 random applicants
        const selectedCandidates = faker.helpers.arrayElements(
          allCandidates,
          numberOfApplications
        );

        const newApplications = selectedCandidates.map((candidate) => ({
          id: crypto.randomUUID(),
          jobId: newJob.id,
          candidateId: candidate.id,
          stage: "applied",
          appliedAt: new Date().toISOString(),
        }));

        if (newApplications.length > 0) {
          await db.applications.bulkAdd(newApplications);
          console.log(
            `SUCCESS: Created ${newApplications.length} new applications for job '${newJob.title}'.`
          );
        }
      }

      return HttpResponse.json(newJob, { status: 201 });
    } catch (error) {
      console.error("MSW Handler Error (POST /api/jobs):", error);
      return HttpResponse.json(
        { message: "Failed to create job in database" },
        { status: 500 }
      );
    }x
  }),

  http.patch("/api/jobs/:id", async ({ request, params }) => {
    await simulateNetwork();
    try {
      const { id } = params;
      const updates = await request.json();
      const updatedCount = await db.jobs.update(id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      if (updatedCount === 0) {
        return HttpResponse.json({ message: "Job not found" }, { status: 404 });
      }
      const updatedJob = await db.jobs.get(id);
      return HttpResponse.json(updatedJob);
    } catch (error) {
      console.error("MSW Handler Error (PATCH /api/jobs/:id):", error);
      return HttpResponse.json(
        { message: "Failed to update job in database" },
        { status: 500 }
      );
    }
  }),

  http.get("/api/jobs/:id", async ({ params }) => {
    await simulateNetwork();
    try {
      const { id } = params;
      const job = await db.jobs.get(id);
      if (job) {
        return HttpResponse.json(job);
      } else {
        return HttpResponse.json({ message: "Job not found" }, { status: 404 });
      }
    } catch (error) {
      console.error("MSW Handler Error (GET /api/jobs/:id):", error);
      return HttpResponse.json(
        { message: "Failed to access database" },
        { status: 500 }
      );
    }
  }),

  http.post("/api/jobs/reorder", async ({ request }) => {
    await simulateNetwork();
    try {
      const { orderedIds } = await request.json();
      await db.transaction("rw", db.jobs, async () => {
        const updates = orderedIds.map((id, index) =>
          db.jobs.update(id, { order: index + 1 })
        );
        await Promise.all(updates);
      });
      return HttpResponse.json({ message: "Reorder successful" });
    } catch (error) {
      console.error("MSW Handler Error (POST /api/jobs/reorder):", error);
      return HttpResponse.json(
        { message: "Failed to reorder jobs" },
        { status: 500 }
      );
    }
  }),

  http.get("/api/candidates", async () => {
    await simulateNetwork();
    try {
      const candidates = await db.candidates.toArray();
      return HttpResponse.json(candidates);
    } catch (error) {
      console.error("MSW Handler Error (GET /api/candidates):", error);
      return HttpResponse.json(
        { message: "Failed to fetch candidates" },
        { status: 500 }
      );
    }
  }),

  // --- MINOR FIX: Changed endpoint from "/" to "/api/applications" ---
  http.get("/api/applications", async ({ request }) => {
    await simulateNetwork();
    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId");
    const candidateId = url.searchParams.get("candidateId");
    try {
      let applications;
      if (candidateId) {
        applications = await db.applications
          .where("candidateId")
          .equals(candidateId)
          .toArray();
      } else if (jobId) {
        applications = await db.applications
          .where("jobId")
          .equals(jobId)
          .toArray();
      } else {
        applications = await db.applications.toArray();
      }
      if (applications.length > 0) {
        const candidateIds = [
          ...new Set(applications.map((app) => app.candidateId)),
        ];
        const jobIds = [...new Set(applications.map((app) => app.jobId))];
        const candidates = await db.candidates
          .where("id")
          .anyOf(candidateIds)
          .toArray();
        const jobs = await db.jobs.where("id").anyOf(jobIds).toArray();
        const candidateMap = new Map(candidates.map((c) => [c.id, c]));
        const jobMap = new Map(jobs.map((j) => [j.id, j]));
        const enrichedApplications = applications.map((app) => ({
          ...app,
          candidate: candidateMap.get(app.candidateId) || null,
          job: jobMap.get(app.jobId) || null,
        }));
        return HttpResponse.json(enrichedApplications);
      }
      return HttpResponse.json([]);
    } catch (error) {
      console.error("MSW Error (GET /api/applications):", error);
      return HttpResponse.json(
        { message: "Failed to fetch applications" },
        { status: 500 }
      );
    }
  }),

  // --- MODIFIED: This is the handler with your new logic ---
  http.patch("/api/applications/:id", async ({ request, params }) => {
    await simulateNetwork();
    try {
      const { id } = params;
      const updates = await request.json();
      const currentApplication = await db.applications.get(id);
      if (!currentApplication) {
        return HttpResponse.json(
          { message: "Application not found" },
          { status: 404 }
        );
      }

      // LOGIC 1: Save stage change to the main timeline (as you requested)
      const timelineEntry = {
        candidateId: currentApplication.candidateId,
        jobId: currentApplication.jobId,
        previousStage: currentApplication.stage,
        newStage: updates.stage,
        timestamp: new Date().toISOString(),
      };
      await db.candidateTimeline.add(timelineEntry);
      console.log(
        `HISTORY: Candidate ${timelineEntry.candidateId} moved from ${timelineEntry.previousStage} to ${timelineEntry.newStage}.`
      );

      // LOGIC 2 & 3: If moving TO the 'tech' stage, set status and start the timer
      if (updates.stage === "tech" && currentApplication.stage !== "tech") {
        // Set 'pending' status for Kanban board logic
        const newAssessmentStatus = {
          candidateId: currentApplication.candidateId,
          jobId: currentApplication.jobId,
          status: "pending",
        };
        await db.candidateAssessments.put(newAssessmentStatus);

        // Create the new timing record with a start time
        const timingRecord = {
          candidateId: currentApplication.candidateId,
          jobId: currentApplication.jobId,
          startTime: new Date().toISOString(),
          endTime: null, // End time is null until submitted
        };
        await db.assessmentTimings.put(timingRecord);
        console.log(
          `%cASSESSMENT TIMER STARTED: Candidate ${timingRecord.candidateId}`,
          "color: #ef4444; font-weight: bold;"
        );
      }

      await db.applications.update(id, updates);
      return HttpResponse.json(await db.applications.get(id));
    } catch (error) {
      console.error("MSW Error (PATCH /api/applications/:id):", error);
      return HttpResponse.json(
        { message: "Failed to update application" },
        { status: 500 }
      );
    }
  }),

  http.get("/api/candidates/:candidateId/jobs", async ({ params }) => {
    // ... (rest of the file is unchanged)
    try {
      const { candidateId } = params;
      const applications = await db.applications
        .where({ candidateId })
        .toArray();
      const jobIds = [...new Set(applications.map((app) => app.jobId))];
      if (jobIds.length === 0) {
        return HttpResponse.json([]);
      }
      const jobs = await db.jobs.where("id").anyOf(jobIds).toArray();
      return HttpResponse.json(jobs);
    } catch (error) {
      console.error("MSW Error (GET candidate jobs):", error);
      return HttpResponse.json(
        { message: "Failed to fetch jobs for candidate" },
        { status: 500 }
      );
    }
  }),

  http.get(
    "/api/candidates/:candidateId/timeline",
    async ({ request, params }) => {
      const { candidateId } = params;
      const url = new URL(request.url);
      const jobId = url.searchParams.get("jobId");
      if (!jobId) return HttpResponse.json([]);
      try {
        const timelineEvents = await db.candidateTimeline
          .where({ candidateId, jobId })
          .sortBy("timestamp");
        return HttpResponse.json(timelineEvents.reverse());
      } catch (error) {
        return HttpResponse.json(
          { message: "Failed to fetch timeline" },
          { status: 500 }
        );
      }
    }
  ),

  http.get("/api/candidates/:candidateId", async ({ params }) => {
    try {
      const { candidateId } = params;
      const candidate = await db.candidates.get(candidateId);
      if (candidate) {
        return HttpResponse.json(candidate);
      }
      return HttpResponse.json(
        { message: "Candidate not found" },
        { status: 404 }
      );
    } catch (error) {
      return HttpResponse.json(
        { message: "Failed to fetch candidate" },
        { status: 500 }
      );
    }
  }),

  http.get(
    "/api/candidates/:candidateId/notes",
    async ({ request, params }) => {
      await simulateNetwork();
      const { candidateId } = params;
      const url = new URL(request.url);
      const jobId = url.searchParams.get("jobId");
      if (!jobId) return HttpResponse.json([]);
      try {
        const notes = await db.notes
          .where({ candidateId, jobId })
          .sortBy("createdAt");
        return HttpResponse.json(notes.reverse());
      } catch (error) {
        console.error("Error fetching notes:", error);
        return HttpResponse.json(
          { message: "Failed to fetch notes" },
          { status: 500 }
        );
      }
    }
  ),

  http.post(
    "/api/candidates/:candidateId/notes",
    async ({ request, params }) => {
      await simulateNetwork();
      try {
        const { candidateId } = params;
        const { content, jobId } = await request.json();
        if (!jobId) {
          return HttpResponse.json(
            { message: "jobId is required" },
            { status: 400 }
          );
        }
        if (!content || content.trim() === "") {
          return HttpResponse.json(
            { message: "content is required" },
            { status: 400 }
          );
        }
        const mentionedNames = (content.match(/@([a-zA-Z\s]+)/g) || []).map(
          (m) => m.substring(1).trim()
        );
        const mentionedUserIds = teamMembers
          .filter((m) => mentionedNames.includes(m.name))
          .map((m) => m.id);
        const newNote = {
          candidateId,
          jobId,
          content: content.trim(),
          authorId: "user-1",
          createdAt: new Date().toISOString(),
          mentionedUserIds,
        };
        const savedNoteId = await db.notes.add(newNote);
        const savedNote = { ...newNote, id: savedNoteId };
        console.log("Note saved successfully:", savedNote);
        return HttpResponse.json(savedNote, { status: 201 });
      } catch (error) {
        console.error("MSW Error (POST note):", error);
        return HttpResponse.json(
          { message: "Failed to save note" },
          { status: 500 }
        );
      }
    }
  ),
  // Add this new handler inside your `export const handlers = [...]` array

  http.get("/api/jobs/:jobId/candidate-assessments", async ({ params }) => {
    await simulateNetwork();
    try {
      const { jobId } = params;

      // Fetch all status records from the 'candidateAssessments' table for the given job
      const statuses = await db.candidateAssessments.where({ jobId }).toArray();

      // Convert the array into a map object for easier and faster lookup on the frontend
      // The result will be like: { "candidate-id-1": { status: "pending" }, "candidate-id-2": { status: "submitted" } }
      const statusMap = statuses.reduce((acc, status) => {
        acc[status.candidateId] = status;
        return acc;
      }, {});

      return HttpResponse.json(statusMap);
    } catch (error) {
      console.error(
        "MSW Error (GET /api/jobs/:jobId/candidate-assessments):",
        error
      );
      return HttpResponse.json(
        { message: "Failed to fetch assessment statuses" },
        { status: 500 }
      );
    }
  }),

  http.get("/api/assessments/:jobId", async ({ params }) => {
    await simulateNetwork();
    try {
      const { jobId } = params;
      const assessment = await db.assessments.get(jobId);
      if (assessment) {
        return HttpResponse.json(assessment);
      }
      return HttpResponse.json(
        { message: "Assessment not found" },
        { status: 404 }
      );
    } catch (error) {
      console.error("MSW Error (GET /api/assessments/:jobId):", error);
      return HttpResponse.json(
        { message: "Failed to fetch assessment" },
        { status: 500 }
      );
    }
  }),

  http.put("/api/assessments/:jobId", async ({ request, params }) => {
    await simulateNetwork();
    try {
      const { jobId } = params;
      const { assessmentData } = await request.json();
      const jobRecord = await db.jobs.get(jobId);
      const jobTitle = jobRecord ? jobRecord.title : "Unknown Job";
      const assessmentToSave = {
        jobId: jobId,
        jobTitle: jobTitle,
        assessmentData: assessmentData,
        updatedAt: new Date(),
      };
      await db.assessments.put(assessmentToSave);
      return HttpResponse.json(assessmentToSave);
    } catch (error) {
      console.error("MSW Error (PUT /api/assessments/:jobId):", error);
      return HttpResponse.json(
        { message: "Failed to save assessment" },
        { status: 500 }
      );
    }
  }),

  http.post("/api/assessments/:jobId/submit", async ({ request, params }) => {
    await simulateNetwork();
    try {
      const { applicationId, responses } = await request.json();
      const { jobId } = params;
      const application = await db.applications.get(applicationId);

      if (application) {
        // Update the status to 'submitted'
        await db.candidateAssessments.put({
          candidateId: application.candidateId,
          jobId: jobId,
          status: "submitted",
        });
        // Update the timing record with the end time
        await db.assessmentTimings.update([application.candidateId, jobId], {
          endTime: new Date().toISOString(),
        });
        console.log(
          `%cASSESSMENT TIMER ENDED: Candidate ${application.candidateId}`,
          "color: #22c55e; font-weight: bold;"
        );
      }

      const responseToSave = {
        applicationId,
        responses,
        submittedAt: new Date().toISOString(),
      };
      await db.assessmentResponses.put(responseToSave);

      return HttpResponse.json(responseToSave, { status: 201 });
    } catch (error) {
      console.error("MSW Error (POST /api/assessments/:jobId/submit):", error);
      return HttpResponse.json(
        { message: "Failed to submit assessment" },
        { status: 500 }
      );
    }
  }),

  http.get(
    "/api/candidates/:candidateId/assessment-timing",
    async ({ request, params }) => {
      await simulateNetwork();
      try {
        const { candidateId } = params;
        const url = new URL(request.url);
        const jobId = url.searchParams.get("jobId");

        if (!jobId) return HttpResponse.json(null);

        const timingRecord = await db.assessmentTimings.get([
          candidateId,
          jobId,
        ]);
        return HttpResponse.json(timingRecord || null);
      } catch (error) {
        console.error("MSW Error (GET assessment-timing):", error);
        return HttpResponse.json(
          { message: "Failed to fetch timing data" },
          { status: 500 }
        );
      }
    }
  ),

  http.get("/api/assessment-responses/:applicationId", async ({ params }) => {
    await simulateNetwork();
    try {
      const { applicationId } = params;
      const response = await db.assessmentResponses.get(applicationId);
      if (response) {
        return HttpResponse.json(response);
      } else {
        return HttpResponse.json(
          { message: "Response not found" },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error(
        "MSW Error (GET /api/assessment-responses/:applicationId):",
        error
      );
      return HttpResponse.json(
        { message: "Failed to fetch response" },
        { status: 500 }
      );
    }
  }),
];
