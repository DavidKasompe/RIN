import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq, or, ilike } from "drizzle-orm";

export const getStudentProfileTool = createTool({
  id: "getStudentProfile",
  description:
    "Fetch a student's full demographic, attendance, and risk score data using their ID or name. Use this tool first when asked to analyze a student.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        'The student ID or name to search for (e.g., "STU-123" or "Marcus").',
      ),
  }),
  outputSchema: z.object({
    profile: z.any().optional(),
    message: z.string(),
  }),
  execute: async ({ query }) => {
    if (!db) return { message: "Database connection not initialized." };
    try {
      const results = await db
        .select()
        .from(students)
        .where(
          or(eq(students.studentId, query), ilike(students.name, `%${query}%`)),
        );

      if (results.length === 0) {
        return { message: `No student found matching "${query}".` };
      }

      const student = results[0];

      return {
        profile: {
          id: student.id,
          studentId: student.studentId,
          name: student.name,
          grade: student.grade,
          attendanceRate: student.attendanceRate,
          lastRiskScore: student.lastRiskScore,
          lastRiskCategory: student.lastRiskCategory,
          notes: student.notes,
          tags: student.tags,
        },
        message: "Successfully retrieved student profile.",
      };
    } catch (error) {
      console.error("getStudentProfileTool error:", error);
      return { message: "Error fetching student profile from the database." };
    }
  },
});
