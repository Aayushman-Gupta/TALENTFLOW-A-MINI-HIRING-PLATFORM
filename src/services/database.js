import Dexie from 'dexie';

// Define the database class, which will manage our tables
export class TalentFlowDB extends Dexie {
  constructor() {
    // The name of the database is 'TalentFlowDB'
    super('TalentFlowDB');

    // Define the database schema (version 1)
    this.version(1).stores({
      // The 'jobs' table will be indexed by 'id' (primary key), 'status', and 'order'
      // This allows us to quickly query for jobs by their status or sort them by order.
      jobs: 'id, status, order, description,requirements,createdAt',
      candidates: 'id, name, email',
      applications: 'id, jobId, candidateId, stage, appliedAt',
      // assessments: 'id, jobId',
      candidateTimeline: '++id, [candidateId+jobId], timestamp',
      notes: '++id, [candidateId+jobId], createdAt, *mentionedUserIds',
      assessments: "jobId, updatedAt",
      assessmentResponses: "applicationId, submittedAt",
      candidateAssessments: '[candidateId+jobId], jobId, status',

    });
  }
}
// Export a single, shared instance of the database for the entire application to use
export const db = new TalentFlowDB();