import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '@/db';
import { students } from '@/db/schema';
import { eq, and, ilike } from 'drizzle-orm';

export const getCohortRiskAnalysisTool = createTool({
    id: 'getCohortRiskAnalysis',
    name: 'getCohortRiskAnalysis',
    description: 'Analyze risk patterns across an entire grade level or cohort of students. Identifies at-risk clusters and collective trends.',
    inputSchema: z.object({
        gradeLevel: z.string().optional().describe('Grade level to analyze, e.g. "9" or "10th"'),
        riskThreshold: z.number().default(60).describe("Score above which a student is considered at-risk for cohort purposes"),
    }),
    execute: async ({ context }) => {
        // We'd typically get this from context/session, but right now we only have basic context
        // Try getting a dummy ID if we don't have true auth injection in the agent yet
        const userId = 'user_1';

        const { gradeLevel, riskThreshold } = context;

        let queryMatches = [];

        // Fuzzy filter by grade level if provided
        if (gradeLevel) {
            // Strip any "th" or "Grade " prefix
            const cleanGrade = gradeLevel.replace(/th/i, '').replace(/grade/i, '').trim();
            queryMatches = await db.select().from(students).where(
                and(
                    eq(students.userId, userId),
                    ilike(students.grade, `%${cleanGrade}%`)
                )
            );
        } else {
            queryMatches = await db.select().from(students).where(eq(students.userId, userId));
        }

        if (queryMatches.length === 0) {
            return {
                gradeLevel: gradeLevel || 'All Grades',
                totalStudents: 0,
                atRiskCount: 0,
                criticalCount: 0,
                atRiskPercent: 0,
                avgGpa: 0,
                avgAttendance: 0,
                avgRiskScore: 0,
                topRiskFactors: [],
                topAtRiskStudents: [],
                insight: '',
                message: `No students found for cohort analysis (Grade: ${gradeLevel || 'All'}).`
            };
        }

        let totalGpa = 0;
        let totalAttendance = 0;
        let totalRiskScore = 0;
        let atRiskCount = 0;
        let criticalCount = 0;
        
        let lowAttendanceCount = 0;
        let lowGpaCount = 0;
        let lowCompletionCount = 0;
        let highReferralsCount = 0;

        for (const s of queryMatches) {
            totalGpa += s.gpa;
            totalAttendance += s.attendanceRate;
            const score = s.lastRiskScore || 0;
            totalRiskScore += score;
            
            if (score >= riskThreshold) atRiskCount++;
            if (score >= 75) criticalCount++;

            if (s.attendanceRate < 85) lowAttendanceCount++;
            if (s.gpa < 2.5) lowGpaCount++;
            if (s.assignmentCompletion < 80) lowCompletionCount++;
            if (s.behaviorReferrals >= 2) highReferralsCount++;
        }

        const totalStudents = queryMatches.length;
        const atRiskPercent = Math.round((atRiskCount / totalStudents) * 100);

        // Sort risk factors to get top 3
        const factorCounts = [
            { name: 'Low Attendance', count: lowAttendanceCount },
            { name: 'Low GPA', count: lowGpaCount },
            { name: 'Missing Assignments', count: lowCompletionCount },
            { name: 'Behavioral Referrals', count: highReferralsCount },
        ].sort((a, b) => b.count - a.count);

        const topRiskFactors = factorCounts.slice(0, 3).filter(f => f.count > 0).map(f => f.name);

        // Sort students logically for top at risk
        const sortedStudents = [...queryMatches].sort((a, b) => (b.lastRiskScore || 0) - (a.lastRiskScore || 0));
        const topAtRiskStudents = sortedStudents.slice(0, 5).map(s => ({
            name: s.name,
            riskScore: s.lastRiskScore || 0,
            category: s.lastRiskCategory || 'Unknown'
        }));

        let insight = '';
        if (atRiskPercent > 30) {
            insight = `ALERT: More than 30% of ${gradeLevel || 'these'} students are at or above the risk threshold.`;
        } else if (atRiskPercent > 15) {
            insight = `Notice: ${atRiskPercent}% of students are showing early warning signs.`;
        }

        return {
            gradeLevel: gradeLevel || 'All Grades',
            totalStudents,
            atRiskCount,
            criticalCount,
            atRiskPercent,
            avgGpa: parseFloat((totalGpa / totalStudents).toFixed(2)),
            avgAttendance: Math.round(totalAttendance / totalStudents),
            avgRiskScore: Math.round(totalRiskScore / totalStudents),
            topRiskFactors,
            topAtRiskStudents,
            insight,
            message: `Analyzed ${totalStudents} students. ${atRiskPercent}% are at risk. Top factors: ${topRiskFactors.join(', ')}.`
        };
    }
});
