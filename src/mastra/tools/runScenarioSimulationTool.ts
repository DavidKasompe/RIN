import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '@/db';
import { students } from '@/db/schema';
import { eq, or, ilike } from 'drizzle-orm';

export const runScenarioSimulationTool = createTool({
    id: 'runScenarioSimulation',
    name: 'runScenarioSimulation',
    description: 'Simulate how a student\'s risk score would change if their attendance, GPA, or other factors improved or worsened. Use for "what if" questions.',
    inputSchema: z.object({
        studentQuery: z.string().describe("Student ID or name"),
        scenarios: z.array(z.object({
            factor: z.enum([
                "attendanceRate",
                "gpa",
                "assignmentCompletion",
                "behaviorReferrals",
                "lateSubmissions",
            ]),
            change: z.number().describe("Absolute change (e.g. +10 for attendance, -0.3 for GPA, -2 for referrals)"),
        })).describe("List of hypothetical changes to simulate"),
    }),
    execute: async ({ context }) => {
        const { studentQuery, scenarios } = context;

        // Fetch student from DB
        const match = await db.query.students.findFirst({
            where: or(
                ilike(students.name, `%${studentQuery}%`),
                eq(students.id, studentQuery)
            )
        });

        if (!match) {
            return {
                message: `Could not find a student matching "${studentQuery}".`,
                studentName: studentQuery,
                currentScore: 0,
                currentCategory: 'Unknown',
                simulatedScore: 0,
                simulatedCategory: 'Unknown',
                delta: 0,
                scenarioSummary: ''
            };
        }

        // Deep copy current metrics to apply scenario variables
        const simMetrics = {
            attendanceRate: match.attendanceRate,
            gpa: match.gpa,
            assignmentCompletion: match.assignmentCompletion,
            behaviorReferrals: match.behaviorReferrals,
            lateSubmissions: match.lateSubmissions ?? 0
        };

        const changesDesc: string[] = [];

        for (const scenario of scenarios) {
            const { factor, change } = scenario;
            
            simMetrics[factor] += change;

            // Clamp values
            if (factor === 'attendanceRate') simMetrics[factor] = Math.max(0, Math.min(100, simMetrics[factor]));
            if (factor === 'gpa') simMetrics[factor] = Math.max(0, Math.min(4.0, simMetrics[factor]));
            if (factor === 'assignmentCompletion') simMetrics[factor] = Math.max(0, Math.min(100, simMetrics[factor]));
            if (factor === 'behaviorReferrals') simMetrics[factor] = Math.max(0, simMetrics[factor]);
            if (factor === 'lateSubmissions') simMetrics[factor] = Math.max(0, simMetrics[factor]);
            
            // Build text format of the change e.g "attendanceRate by +10"
            const sign = change > 0 ? '+' : '';
            changesDesc.push(`${factor} changes by ${sign}${change}`);
        }

        const scenarioSummary = `If ${changesDesc.join(' and ')}`;

        // Calculate Score Formula (Matches /api/analyze formula)
        const calculateScoreAndCategory = (metrics: typeof simMetrics) => {
            const attendanceRisk = Math.max(0, (85 - metrics.attendanceRate) * 1.5);
            const gpaRisk = Math.max(0, (2.5 - metrics.gpa) * 20);
            const completionRisk = Math.max(0, (80 - metrics.assignmentCompletion) * 1.0);
            const behaviorRisk = metrics.behaviorReferrals * 5;
            const lateRisk = metrics.lateSubmissions * 1.5;

            const rawScore = attendanceRisk + gpaRisk + completionRisk + behaviorRisk + lateRisk;
            const score = Math.min(100, Math.round(rawScore));

            let category = 'Low Risk';
            if (score >= 30) category = 'Moderate Risk';
            if (score >= 55) category = 'At Risk';
            if (score >= 75) category = 'Critical';

            return { score, category };
        };

        const current = calculateScoreAndCategory({
            attendanceRate: match.attendanceRate,
            gpa: match.gpa,
            assignmentCompletion: match.assignmentCompletion,
            behaviorReferrals: match.behaviorReferrals,
            lateSubmissions: match.lateSubmissions ?? 0
        });

        const simulated = calculateScoreAndCategory(simMetrics);
        const delta = simulated.score - current.score;

        return {
            studentName: match.name,
            currentScore: current.score,
            currentCategory: current.category,
            simulatedScore: simulated.score,
            simulatedCategory: simulated.category,
            delta,
            scenarioSummary,
            message: `Current risk score for ${match.name} is ${current.score} (${current.category}). ` + 
                     `${scenarioSummary}, the score would ${delta > 0 ? 'increase' : 'decrease'} to ${simulated.score} (${simulated.category}), a change of ${delta}.`
        };
    }
});
