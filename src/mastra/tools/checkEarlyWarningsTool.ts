import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '@/db';
import { earlyWarnings, students } from '@/db/schema';
import { eq, ilike, or } from 'drizzle-orm';

export const checkEarlyWarningsTool = createTool({
  id: 'checkEarlyWarnings',
  description: 'Check which students have crossed risk thresholds and need immediate attention',
  inputSchema: z.object({
    studentQuery: z.string().optional().describe('Optional name/ID to check a specific student. If omitted, checks all students.'),
  }),
  execute: async ({ studentQuery }) => {
    if (!db) return { success: false, message: 'Database disconnected' };
    
    let targetStudents = [];
    if (studentQuery) {
      // Find specific student
      targetStudents = await db.select().from(students).where(
        or(
          ilike(students.name, `%${studentQuery}%`),
          ilike(students.studentId, `%${studentQuery}%`)
        )
      );
    } else {
      // Check all
      targetStudents = await db.select().from(students);
    }

    const warningsToInsert = [];
    const generatedWarnings = [];

    for (const student of targetStudents) {
      // Logic: query students WHERE:
      // - `attendanceRate < 70` → trigger `'attendance'` warning
      // - `gpa < 2.0` → trigger `'gpa'` warning
      // - `lastRiskScore > 75` → trigger `'risk_score'` warning
      // - `behaviorReferrals >= 3` → trigger `'behavior'` warning

      if (student.attendanceRate < 70) {
        warningsToInsert.push({ studentId: student.id, triggeredBy: 'attendance', threshold: 70, message: `Attendance has dropped below 70% (currently ${student.attendanceRate}%)` });
        generatedWarnings.push({ student, trigger: 'attendance', message: `Attendance has dropped below 70% (currently ${student.attendanceRate}%)` });
      }
      if (student.gpa < 2.0) {
        warningsToInsert.push({ studentId: student.id, triggeredBy: 'gpa', threshold: 2.0, message: `GPA has dropped below 2.0 (currently ${student.gpa})` });
        generatedWarnings.push({ student, trigger: 'gpa', message: `GPA has dropped below 2.0 (currently ${student.gpa})` });
      }
      if (student.lastRiskScore && student.lastRiskScore > 75) {
        warningsToInsert.push({ studentId: student.id, triggeredBy: 'risk_score', threshold: 75, message: `Overall risk score is critically high (currently ${student.lastRiskScore})` });
        generatedWarnings.push({ student, trigger: 'risk_score', message: `Overall risk score is critically high (currently ${student.lastRiskScore})` });
      }
      if (student.behaviorReferrals >= 3) {
        warningsToInsert.push({ studentId: student.id, triggeredBy: 'behavior', threshold: 3, message: `Student has 3 or more behavior referrals (currently ${student.behaviorReferrals})` });
        generatedWarnings.push({ student, trigger: 'behavior', message: `Student has 3 or more behavior referrals (currently ${student.behaviorReferrals})` });
      }
    }

    // Upsert into earlyWarnings
    for (const warning of warningsToInsert) {
      // Simple insert, we check if one already exists and is unresolved so we don't duplicate
      const [existing] = await db.select().from(earlyWarnings).where(
        eq(earlyWarnings.studentId, warning.studentId)
      ).limit(10); // Find recent ones

      const isDuplicate = existing?.triggeredBy === warning.triggeredBy && existing?.resolved === false;

      if (!isDuplicate) {
        await db.insert(earlyWarnings).values({
          id: crypto.randomUUID(),
          ...warning
        });
      }
    }

    return { 
      warnings: generatedWarnings,
      total: generatedWarnings.length,
      message: `Checked ${targetStudents.length} students. Found ${generatedWarnings.length} active warnings.`
    };
  },
});
