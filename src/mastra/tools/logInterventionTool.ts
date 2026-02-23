import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '@/db';
import { interventions, students } from '@/db/schema';
import { ilike, or } from 'drizzle-orm';

export const logInterventionTool = createTool({
  id: 'logIntervention',
  description: 'Log an intervention action taken for a student (meeting, phone call, referral, etc)',
  inputSchema: z.object({
    studentQuery: z.string().describe('The name or ID of the student'),
    type: z.enum(['meeting', 'phone_call', 'email', 'referral', 'mentoring']).describe('Type of intervention'),
    notes: z.string().describe('Notes about the intervention'),
    outcome: z.enum(['positive', 'neutral', 'escalated', 'pending']).optional().describe('Result of the intervention'),
    followUpDate: z.string().optional().describe('ISO date string for follow up'),
    counselorId: z.string().optional().describe('Optional ID of the counselor logging it, default system user used if omitted'),
  }),
  execute: async ({ studentQuery, type, notes, outcome, followUpDate, counselorId }) => {
    if (!db) return { success: false, message: 'Database disconnected' };
    
    // Fallback counselor ID if not provided (matches seed data "u1")
    const authorId = counselorId || 'u1';

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

    const interventionId = crypto.randomUUID();
    
    await db.insert(interventions).values({
      id: interventionId,
      studentId: student.id,
      counselorId: authorId,
      type,
      notes,
      outcome,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
    });

    return { 
      success: true, 
      interventionId, 
      message: `Successfully logged a ${type} intervention for ${student.name}.` 
    };
  },
});
