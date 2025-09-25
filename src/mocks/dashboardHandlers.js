import { http, HttpResponse } from "msw";
import { db } from "../services/database";

// Helper to simulate realistic network latency
const simulateNetwork = async () => {
  const delay = Math.random() * 400 + 100; // 100ms - 500ms delay
  await new Promise((res) => setTimeout(res, delay));
};

export const dashboardHandlers = [
  http.get("/api/dashboard/stats", async () => {
    await simulateNetwork();
    try {
      // Run all database count queries in parallel for better performance
      const [
        totalJobs,
        activeJobs,
        totalCandidates,
        totalApplications,
        totalHired,
      ] = await Promise.all([
        db.jobs.count(),
        db.jobs.where('status').equals('active').count(),
        db.candidates.count(),
        db.applications.count(),
        db.applications.where('stage').equals('hired').count(),
      ]);

      // Construct the response object
      const stats = {
        totalJobs,
        activeJobs,
        totalCandidates,
        totalApplications,
        totalHired,
      };

      return HttpResponse.json(stats);

    } catch (error) {
      console.error("MSW Handler Error (GET /api/dashboard/stats):", error);
      return HttpResponse.json(
        { message: "Failed to fetch dashboard stats" },
        { status: 500 }
      );
    }
  }),
];