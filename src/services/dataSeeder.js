// src/services/dataSeeder.js

import { faker } from '@faker-js/faker';
import { db } from './database'; // Import your Dexie instance

// --- Data Generation Function ---
const createRandomCandidate = () => {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
  };
};

const createRandomApplication = (jobId, candidateId) => {
  return {
    id: faker.string.uuid(),
    jobId: jobId,
    candidateId: candidateId,
    // As requested, all seeded applications start at the 'applied' stage
    stage: 'applied',
    // Use a recent date for a realistic application time
    appliedAt: faker.date.recent({ days: 30 }).toISOString(),
  };
};


// --- The Main Seeder Function ---
export async function seedDatabase() {
  try {
    // Check if the 'candidates' table is empty
    const candidateCount = await db.candidates.count();
    if (candidateCount === 0) {
      console.log("Database 'candidates' table is empty. Seeding with 1000+ candidates...");
      const candidatesToSeed = [];
      for (let i = 0; i < 1050; i++) {
        candidatesToSeed.push(createRandomCandidate());
      }
      await db.candidates.bulkAdd(candidatesToSeed);
      console.log("Candidate seeding complete.");
    }


    const applicationCount = await db.applications.count();
    if (applicationCount === 0) {
      console.log("Database 'applications' table is empty. Seeding with initial data...");

      const jobs = await db.jobs.where('status').equals('active').toArray();
      const candidates = await db.candidates.toArray();

      if (jobs.length > 0 && candidates.length > 0) {
        const applicationsToSeed = [];
        const maxApplications = Math.min(candidates.length, 500); //  up to 500 applications
        const usedCandidates = new Set();

        for (let i = 0; i < maxApplications; i++) {
          const randomJob = faker.helpers.arrayElement(jobs);
          let randomCandidate = faker.helpers.arrayElement(candidates);

          // Ensure we get a candidate that hasn't applied to this job yet
          let attempts = 0;
          while (usedCandidates.has(`${randomCandidate.id}-${randomJob.id}`) && attempts < 10) {
            randomCandidate = faker.helpers.arrayElement(candidates);
            attempts++;
          }

          if (!usedCandidates.has(`${randomCandidate.id}-${randomJob.id}`)) {
              applicationsToSeed.push(createRandomApplication(randomJob.id, randomCandidate.id));
              usedCandidates.add(`${randomCandidate.id}-${randomJob.id}`);
          }
        }

        await db.applications.bulkAdd(applicationsToSeed);
        console.log(`${applicationsToSeed.length} applications seeded successfully.`);
      }
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}