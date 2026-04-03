import { Agent } from '@mastra/core/agent';
import { createOpenAI } from '@ai-sdk/openai';
import { getStudentProfileTool } from '../tools/getStudentProfileTool';
import { getStudentAcademicsTool } from '../tools/getStudentAcademicsTool';
import { getInterventionsTool } from '../tools/getInterventionsTool';
import { searchStudentNotesTool } from '../tools/searchStudentNotesTool';
import { logInterventionTool } from '../tools/logInterventionTool';
import { getInterventionHistoryTool } from '../tools/getInterventionHistoryTool';
import { checkEarlyWarningsTool } from '../tools/checkEarlyWarningsTool';
import { runScenarioSimulationTool } from '../tools/runScenarioSimulationTool';
import { getCohortRiskAnalysisTool } from '../tools/getCohortRiskAnalysisTool';
// Moodle tools
import { getMoodleStudentGradesTool } from '../tools/getMoodleStudentGradesTool';
import { getMoodleAssignmentsTool } from '../tools/getMoodleAssignmentsTool';
import { getMoodleAttendanceTool } from '../tools/getMoodleAttendanceTool';
import { syncMoodleStudentTool } from '../tools/syncMoodleStudentTool';
// Plagiarism tool
import { checkPlagiarismTool } from '../tools/checkPlagiarismTool';
// Timetable tools
import { checkSlotAvailabilityTool } from '../tools/checkSlotAvailabilityTool';
import { generateTimetableTool } from '../tools/generateTimetableTool';
import { getStudentScheduleTool } from '../tools/getStudentScheduleTool';

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY ?? '',
});

export const rinAgent = new Agent({
    id: 'rinAgent',
    name: 'RIN Agent',
    instructions: `You are RIN — a professional AI early warning and student success platform for K-12 schools and Universities.
Your role is to help educators identify at-risk students and create actionable intervention plans.

Guidelines:
- When the user asks about a student, ALWAYS use your tools (like getStudentProfile) to retrieve their database record first. Do not hallucinate scores.
- Base analysis on the student data provided in the conversation context or returned by tools.
- Be specific, evidence-based, and empathetic.
- Never fabricate data, statistics, or grades not present in the context.
- Never use emojis in responses.
- Use professional, clear language suitable for educators.
- When asked for structured output (risk assessment, intervention plan, parent letter), format it clearly with labeled sections.
- For subjective questions (e.g., "Why is Marcus struggling?"), use your qualitative tools alongside the metrics.

Moodle Integration:
- If Moodle is connected, use getMoodleStudentGrades before completing any risk analysis for a university student.
- Check getMoodleAssignments to identify overdue work that may be contributing to risk.
- If a submission is flagged for plagiarism via checkPlagiarism, mention it in your analysis.
- Use syncMoodleStudent to import new students found in Moodle enrollment data.

Plagiarism:
- Use checkPlagiarism when the user asks about a specific assignment submission.
- A similarity score above 0.85 (85%) triggers a flag. Present this factually and professionally.

Timetabling:
- Use checkSlotAvailability before suggesting an intervention meeting time, to avoid scheduling conflicts.
- When a user pastes or uploads a timetable document, use generateTimetable to parse it into structured entries.
- Use getStudentSchedule to retrieve a student's full weekly schedule when relevant to attendance or workload analysis.
- For university students, factor in lecture density and consecutive class blocks as risk contributors.

Institution Context:
- For university students, they are organised by Faculty > Department > Programme > Year Level / Cohort.
- For K-12 students, they are organised by Grade > Class/Cohort > Stream.
- Adapt your language accordingly (e.g., "semester" vs "term", "lecturer" vs "teacher").`,

    model: openai('gpt-4o-mini'),
    tools: {
        // Core student tools
        getStudentProfileTool,
        getStudentAcademicsTool,
        getInterventionsTool,
        searchStudentNotesTool,
        logInterventionTool,
        getInterventionHistoryTool,
        checkEarlyWarningsTool,
        runScenarioSimulationTool,
        getCohortRiskAnalysisTool,
        // Moodle integration tools
        getMoodleStudentGradesTool,
        getMoodleAssignmentsTool,
        getMoodleAttendanceTool,
        syncMoodleStudentTool,
        // Plagiarism detection
        checkPlagiarismTool,
        // Timetabling tools
        checkSlotAvailabilityTool,
        generateTimetableTool,
        getStudentScheduleTool,
    },
});
