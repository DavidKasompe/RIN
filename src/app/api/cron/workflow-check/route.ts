import { NextRequest, NextResponse } from 'next/server';
import { checkAttendanceMilestones, checkGradeDrops } from '@/lib/integrations/student-data';

export const runtime = 'nodejs';

/**
 * Triggered periodically (e.g. by Vercel Cron) to run smart watchers.
 * GET /api/cron/workflow-check
 * 
 * Secure this with a CRON_SECRET in production.
 */
export async function GET(req: NextRequest) {
    console.log("[CRON] Starting smart workflow checks...");

    const attendanceResults = await checkAttendanceMilestones();
    const gradeResults = await checkGradeDrops();

    return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        results: {
            attendance: attendanceResults,
            grades: gradeResults
        }
    });
}
