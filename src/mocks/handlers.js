import { http, HttpResponse } from 'msw';
import { db } from '../services/database'; // Import your Dexie database instance

// Helper to simulate realistic network latency
const simulateNetwork = async () => {
  const delay = Math.random() * 800 + 200; // 200ms - 1000ms delay
  await new Promise(res => setTimeout(res, delay));
};

export const handlers = [
  http.get('/api/jobs', async ({ request }) => {
    await simulateNetwork();
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const titleSearch = url.searchParams.get('title');

    try {
      let query = db.jobs.orderBy('order');
      if (status) {
        query = query.filter(job => job.status === status);
      }

      let jobs = await query.toArray();

      // Perform the text search in-memory after fetching the initial set
      if (titleSearch) {
        const searchTerm = titleSearch.toLowerCase();
        jobs = jobs.filter(job =>
          job.title.toLowerCase().includes(searchTerm)

        );
      }

      return HttpResponse.json(jobs);
    } catch (error) {
      console.error("MSW Handler Error (GET /api/jobs):", error);
      return HttpResponse.json({ message: 'Failed to access database' }, { status: 500 });
    }
  }),

  http.post('/api/jobs', async ({ request }) => {
    await simulateNetwork();
    try {
      const newJobData = await request.json();
      const jobCount = await db.jobs.count();

      // 1. Create the new job as before
      const newJob = {
        id: crypto.randomUUID(),
        status: 'active',
        order: jobCount + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...newJobData,
      };
      await db.jobs.add(newJob);

      // --- THIS IS THE CORRECTED LOGIC ---
      const allCandidates = await db.candidates.toArray();

      if (allCandidates.length > 0) {
        // 2. Determine a random number of applications to create.
        //    The number will be between 1 and the total number of candidates available.
        const numberOfApplications = faker.number.int({
            min: 1,
            max: allCandidates.length
        });

        // 3. Select a unique, random subset of candidates.
        //    faker.helpers.arrayElements is perfect for this.
        const selectedCandidates = faker.helpers.arrayElements(allCandidates, numberOfApplications);

        // 4. Create an application object for each selected candidate.
        const newApplications = selectedCandidates.map(candidate => ({
          id: crypto.randomUUID(),
          jobId: newJob.id,
          candidateId: candidate.id,
          stage: 'applied',
          appliedAt: new Date().toISOString(),
        }));

        // 5. Save all new applications to the database.
        if (newApplications.length > 0) {
            await db.applications.bulkAdd(newApplications);
            console.log(`SUCCESS: Created ${newApplications.length} new applications for job '${newJob.title}'.`);
        }
      }
      // 6. Return the created job to the frontend.
      return HttpResponse.json(newJob, { status: 201 });

    } catch (error) {
      console.error("MSW Handler Error (POST /api/jobs):", error);
      return HttpResponse.json({ message: 'Failed to create job in database' }, { status: 500 });
    }
  }),

  http.patch('/api/jobs/:id', async ({ request, params }) => {
    await simulateNetwork();
    try {
      const { id } = params;
      const updates = await request.json();
      // Dexie's 'update' method will merge the 'updates' object with the existing job data.
      const updatedCount = await db.jobs.update(id, {
        ...updates,
        updatedAt: new Date().toISOString(), // Always update the timestamp
      });

      if (updatedCount === 0) {
        return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
      }

      const updatedJob = await db.jobs.get(id);
      return HttpResponse.json(updatedJob);

    } catch (error) {
      console.error("MSW Handler Error (PATCH /api/jobs/:id):", error);
      return HttpResponse.json({ message: 'Failed to update job in database' }, { status: 500 });
    }
  }),

  http.get('/api/jobs/:id', async ({ params }) => {
    await simulateNetwork();
    try {
      const { id } = params;
      const job = await db.jobs.get(id); // Dexie's 'get' is perfect for finding by primary key

      if (job) {
        return HttpResponse.json(job);
      } else {
        return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
      }
    } catch (error) {
      console.error("MSW Handler Error (GET /api/jobs/:id):", error);
      return HttpResponse.json({ message: 'Failed to access database' }, { status: 500 });
    }
  }),

   http.post('/api/jobs/reorder', async ({ request }) => {
    await simulateNetwork();
    try {
      const { orderedIds } = await request.json();
      // Use a Dexie transaction to update all jobs at once for efficiency
      await db.transaction('rw', db.jobs, async () => {
        const updates = orderedIds.map((id, index) =>
          db.jobs.update(id, { order: index + 1 })
        );
        await Promise.all(updates);
      });

      return HttpResponse.json({ message: 'Reorder successful' });
    } catch (error) {
      console.error("MSW Handler Error (POST /api/jobs/reorder):", error);
      return HttpResponse.json({ message: 'Failed to reorder jobs' }, { status: 500 });
    }
  }),

  http.get('/api/candidates', async () => {
    await simulateNetwork(); // Simulate network delay
    try {
      const candidates = await db.candidates.toArray();
      return HttpResponse.json(candidates);
    } catch (error) {
      console.error("MSW Handler Error (GET /api/candidates):", error);
      return HttpResponse.json({ message: 'Failed to fetch candidates' }, { status: 500 });
    }
  }),

   http.get('/api/applications', async ({ request }) => {
    await simulateNetwork();
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');

    if (!jobId) {
      return HttpResponse.json({ message: 'jobId is required' }, { status: 400 });
    }

    try {
      // 1. Find all applications for the given job
      const applications = await db.applications.where('jobId').equals(jobId).toArray();

      // 2. Get the IDs of all candidates who have applied
      const candidateIds = applications.map(app => app.candidateId);

      // 3. Fetch the full details for those candidates
      const candidates = await db.candidates.where('id').anyOf(candidateIds).toArray();
      const candidateMap = new Map(candidates.map(c => [c.id, c]));

      // 4. Combine the application data with the candidate's name and email
      const enrichedApplications = applications.map(app => ({
        ...app,
        candidate: candidateMap.get(app.candidateId) || null,
      }));

      return HttpResponse.json(enrichedApplications);
    } catch (error) {
      return HttpResponse.json({ message: 'Failed to fetch applications' }, { status: 500 });
    }
  }),

  http.patch('/api/applications/:id', async ({ request, params }) => {
    await simulateNetwork();
    try {
      const { id } = params;
      const updates = await request.json(); // This contains the new stage, e.g., { stage: 'screen' }

      // Step A: Fetch the application's current state BEFORE we change it.
      // This is crucial for knowing what the 'previousStage' was.
      const currentApplication = await db.applications.get(id);
      if (!currentApplication) {
        return HttpResponse.json({ message: 'Application not found' }, { status: 404 });
      }
      const previousStage = currentApplication.stage;

      // Step B: Create the new history record object with all the required data.
      const timelineEntry = {
        candidateId: currentApplication.candidateId,
        jobId: currentApplication.jobId,
        previousStage: previousStage,
        newStage: updates.stage,
        timestamp: new Date().toISOString(),
      };

      await db.candidateTimeline.add(timelineEntry);
      await db.applications.update(id, updates);

      const updatedApplication = await db.applications.get(id);

      // A log to confirm in the browser console that the history was created.
      console.log(`TIMELINE EVENT CREATED: Candidate ${timelineEntry.candidateId} moved from ${previousStage} to ${updates.stage}`);

      return HttpResponse.json(updatedApplication);
    } catch (error) {
      console.error("MSW Error (PATCH /api/applications/:id):", error);
      return HttpResponse.json({ message: 'Failed to update application' }, { status: 500 });
    }
  }),


  http.get('/api/candidates/:candidateId/timeline', async ({ params }) => {
    await simulateNetwork();
    try {
        const { candidateId } = params;
        const timelineEvents = await db.candidateTimeline
            .where('candidateId').equals(candidateId)
            .sortBy('timestamp');

        return HttpResponse.json(timelineEvents);
    } catch (error) {
        console.error("MSW Error (GET /api/candidates/:candidateId/timeline):", error);
        return HttpResponse.json({ message: 'Failed to fetch timeline' }, { status: 500 });
    }
  }),


];