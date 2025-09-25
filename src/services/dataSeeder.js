import { faker } from "@faker-js/faker";
import { db } from "./database"; // Import your Dexie instance

const createRandomCandidate = () => {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
  };
};

const createRandomJob = (order) => ({
  id: faker.string.uuid(),
  title: faker.person.jobTitle(),
  department: faker.person.jobArea(),
  location:
    faker.location.city() + ", " + faker.location.state({ abbreviated: true }),
  type: faker.helpers.arrayElement(["Full-time", "Part-time", "Contract"]),
  description: faker.lorem.paragraphs(3),
  requirements: faker.lorem.paragraphs(2),
  status: "active",
  order: order,
  createdAt: faker.date.past({ years: 1 }).toISOString(),
  updatedAt: faker.date.recent().toISOString(),
});

const createRandomApplication = (jobId, candidateId) => {
  return {
    id: faker.string.uuid(),
    jobId: jobId,
    candidateId: candidateId,
    stage: "applied",
    appliedAt: faker.date.recent({ days: 30 }).toISOString(),
  };
};

export async function seedDatabase() {
  try {
    // 1. Seed Candidates if the table is empty
    const candidateCount = await db.candidates.count();
    if (candidateCount === 0) {
      console.log(
        "Database 'candidates' table is empty. Seeding with 1000+ candidates..."
      );
      const candidatesToSeed = Array.from(
        { length: 1050 },
        createRandomCandidate
      );
      await db.candidates.bulkAdd(candidatesToSeed);
      console.log("Candidate seeding complete.");
    }

    // 2. Seed Jobs AND Applications together if the jobs table is empty
    const jobCount = await db.jobs.count();
    if (jobCount === 0) {
      console.log(
        "Database 'jobs' table is empty. Seeding with initial jobs and applications..."
      );

      // --- Create 5 to 6 new jobs ---
      const jobsToSeed = [];
      const numJobs = faker.number.int({ min: 5, max: 6 });
      for (let i = 0; i < numJobs; i++) {
        jobsToSeed.push(createRandomJob(i + 1));
      }
      await db.jobs.bulkAdd(jobsToSeed);
      console.log(`${jobsToSeed.length} initial jobs seeded successfully.`);

      // --- RE-ADDED: Create applications for these newly seeded jobs ---
      const allCandidates = await db.candidates.toArray();
      if (allCandidates.length > 0) {
        const applicationsToSeed = [];
        for (const job of jobsToSeed) {
          const numApplicants = faker.number.int({ min: 20, max: 50 });
          const applicantsForThisJob = faker.helpers.arrayElements(
            allCandidates,
            numApplicants
          );

          for (const candidate of applicantsForThisJob) {
            applicationsToSeed.push(
              createRandomApplication(job.id, candidate.id)
            );
          }
        }

        if (applicationsToSeed.length > 0) {
          await db.applications.bulkAdd(applicationsToSeed);
          console.log(
            `${applicationsToSeed.length} applications seeded successfully for the initial jobs.`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
