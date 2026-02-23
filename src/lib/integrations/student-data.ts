import { db } from "@/db";
import { students } from "@/db/schema";
import { eq, desc, and, lt } from "drizzle-orm";
import { executeWorkflowByIdOrName } from "../workflow-engine/executor";

/**
 * Service to watch for student data changes and trigger smart workflows.
 */

export async function checkAttendanceMilestones() {
    if (!db) return { success: false, error: "Database not connected" };
    console.log("[Data Watcher] Checking for attendance milestones...");

    try {
        // Find students with attendance below 85%
        const atRiskStudents = await db.select().from(students).where(
            lt(students.attendanceRate, 85)
        );

        console.log(`Found ${atRiskStudents.length} students with <85% attendance.`);

        for (const student of atRiskStudents) {
            console.log(`Triggering 'Low Attendance Alert' for ${student.name}`);

            await executeWorkflowByIdOrName('Low Attendance Alert', {
                studentId: student.id,
                studentName: student.name,
                attendanceRate: student.attendanceRate,
                parentEmail: (student as any).parentEmail // Assuming schema has this or fetching separately
            });
        }

        return { success: true, count: atRiskStudents.length };
    } catch (error) {
        console.error("Error in checkAttendanceMilestones:", error);
        return { success: false, error };
    }
}

export async function checkGradeDrops() {
    if (!db) return { success: false, error: "Database not connected" };
    console.log("[Data Watcher] Checking for significant grade drops...");

    try {
        // Find students with GPA below 2.0
        const lowGPAStudents = await db.select().from(students).where(
            lt(students.gpa, 2.0)
        );

        for (const student of lowGPAStudents) {
            console.log(`Triggering 'Academic Risk' for ${student.name}`);

            await executeWorkflowByIdOrName('Academic Risk Alert', {
                studentId: student.id,
                studentName: student.name,
                gpa: student.gpa
            });
        }
        return { success: true, count: lowGPAStudents.length };
    } catch (error) {
        console.error("Error in checkGradeDrops:", error);
        return { success: false, error };
    }
}
