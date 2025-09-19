// // src/mocks/handlers.js

// import { http, HttpResponse } from 'msw';
// import { db } from '../services/database'; // Import your Dexie database instance

// // Helper to simulate realistic network latency
// const simulateNetwork = async () => {
//   const delay = Math.random() * 800 + 200; // 200ms - 1000ms delay
//   await new Promise(res => setTimeout(res, delay));
// };

// export const handlers = [

//   /**
//    * == GET /api/jobs ==
//    * Fetches jobs from the Dexie database.
//    * IMPROVED: Search now also checks the description and requirements fields.
//    */
//   http.get('/api/jobs', async ({ request }) => {
//     await simulateNetwork();
//     const url = new URL(request.url);
//     const status = url.searchParams.get('status');
//     const titleSearch = url.searchParams.get('title');

//     try {
//       // Start with a query ordered by the 'order' index for efficiency
//       let query = db.jobs.orderBy('order');

//       // If a status filter is provided, apply it using the 'status' index
//       if (status) {
//         query = query.filter(job => job.status === status);
//       }

//       let jobs = await query.toArray();

//       // Perform the text search in-memory after fetching the initial set
//       if (titleSearch) {
//         const searchTerm = titleSearch.toLowerCase();
//         jobs = jobs.filter(job =>
//           job.title.toLowerCase().includes(searchTerm) ||
//           (job.description && job.description.toLowerCase().includes(searchTerm)) || // Check description
//           (job.requirements && job.requirements.toLowerCase().includes(searchTerm)) // Check requirements
//         );
//       }

//       return HttpResponse.json(jobs);
//     } catch (error) {
//       console.error("MSW Handler Error (GET /api/jobs):", error);
//       return HttpResponse.json({ message: 'Failed to access database' }, { status: 500 });
//     }
//   }),

//   /**
//    * == POST /api/jobs ==
//    * Creates a new job and saves it to the Dexie database.
//    * IMPROVED: Ensures all fields from the frontend, including description and requirements, are saved.
//    */
//   http.post('/api/jobs', async ({ request }) => {
//     await simulateNetwork();
//     try {
//       const newJobData = await request.json();
//       const jobCount = await db.jobs.count();

//       // The newJob object is created by spreading all properties from the request body.
//       // This automatically includes 'description', 'requirements', and any other fields sent.
//       const newJob = {
//         id: crypto.randomUUID(),
//         status: 'active',
//         order: jobCount + 1,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         ...newJobData,
//       };

//       // The 'add' method saves the entire object to the 'jobs' table in Dexie.
//       await db.jobs.add(newJob);
//       return HttpResponse.json(newJob, { status: 201 });

//     } catch (error) {
//       console.error("MSW Handler Error (POST /api/jobs):", error);
//       return HttpResponse.json({ message: 'Failed to create job in database' }, { status: 500 });
//     }
//   }),

//   /**
//    * == PATCH /api/jobs/:id ==
//    * Updates an existing job in the Dexie database.
//    * IMPROVED: Correctly handles updates to any field, including description and requirements.
//    */
//   http.patch('/api/jobs/:id', async ({ request, params }) => {
//     await simulateNetwork();
//     try {
//       const { id } = params;
//       const updates = await request.json(); // 'updates' can contain description, requirements, etc.

//       // Dexie's 'update' method will merge the 'updates' object with the existing job data.
//       const updatedCount = await db.jobs.update(id, {
//         ...updates,
//         updatedAt: new Date().toISOString(), // Always update the timestamp
//       });

//       if (updatedCount === 0) {
//         return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
//       }

//       const updatedJob = await db.jobs.get(id);
//       return HttpResponse.json(updatedJob);

//     } catch (error) {
//       console.error("MSW Handler Error (PATCH /api/jobs/:id):", error);
//       return HttpResponse.json({ message: 'Failed to update job in database' }, { status: 500 });
//     }
//   }),
// ];