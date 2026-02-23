import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '@/db';
import { interventions, students } from '@/db/schema';
import { eq, ilike, or, desc } from 'drizzle-orm';

export const getInterventionHistoryTool = createTool({
  id: 'getInterventionHistory',
  description: 'Get the full intervention history for a student',
  inputSchema: z.object({
    studentQuery: z.string().describe('The name or ID of the student'),
  }),
  execute: async ({ studentQuery }) => {
    if (!db) return { success: false, message: 'Database disconnected' };
    
    // Find student
    const [student] = await db.select().from(students).where(
      or(
        ilike(students.name, `%${studentQuery}%`),
        ilike(students.studentId, `%${studentQuery}%`)
      )
    );

    if (!student) {
      return { success: false, message: `Could not find student matching "${studentQuery}"` };
    }

    const history = await db.select().from(interventions)
      .where(eq(interventions.studentId, student.id))
      .orderBy(desc(interventions.createdAt));

    return { 
      interventions: history,
      count: history.length,
      message: `Found ${history.length} interventions for ${student.name}.`
    };
  },
});
