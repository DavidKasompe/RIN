import { describe, it, expect, vi } from 'vitest';
import { getStudentProfileTool } from '@/mastra/tools/getStudentProfileTool';
import { getStudentAcademicsTool } from '@/mastra/tools/getStudentAcademicsTool';
import { getInterventionsTool } from '@/mastra/tools/getInterventionsTool';
import { searchStudentNotesTool } from '@/mastra/tools/searchStudentNotesTool';

// Mock OpenAI so we don't hit the real API and consume credits during tests
vi.mock('openai', () => {
    return {
        default: class OpenAI {
            embeddings = {
                create: vi.fn().mockResolvedValue({
                    data: [{ embedding: Array(1536).fill(0.01) }]
                })
            };
        }
    };
});

describe('Mastra Database Tools Integration Tests', () => {
    it('getStudentProfileTool retrieves basic student identity by ID', async () => {
        const result = await getStudentProfileTool.execute!({ query: 'STU-123' } as any, {}) as any;
        expect(result.message).toContain('Successfully retrieved');
        expect(result.profile?.studentId).toBe('STU-123');
        expect(result.profile?.name).toBe('Marcus Aurelius');
    });

    it('getStudentProfileTool retrieves basic student identity by Name', async () => {
        const result = await getStudentProfileTool.execute!({ query: 'Sarah Connor' } as any, {}) as any;
        expect(result.message).toContain('Successfully retrieved');
        expect(result.profile?.studentId).toBe('STU-124');
        expect(result.profile?.name).toBe('Sarah Connor');
    });

    it('getStudentAcademicsTool retrieves academic indicators', async () => {
        const result = await getStudentAcademicsTool.execute!({ query: 'Marcus Aurelius' } as any, {}) as any;
        expect(result.message).toContain('Successfully retrieved');
        expect(result.academics?.gpa).toBe(2.8);
        expect(result.academics?.attendanceRate).toBe(85.0);
    });

    it('getInterventionsTool retrieves an active intervention plan and calendar events', async () => {
        const result = await getInterventionsTool.execute!({ query: 'STU-123' } as any, {}) as any;
        expect(result.message).toContain('Successfully retrieved');
        expect(result.activePlan).toContain('parent-teacher');
        expect(result.events?.length).toBeGreaterThan(0);
        expect(result.behaviorReferrals).toBe(3);
    });

    it('searchStudentNotesTool searches vector embeddings for query', async () => {
        const result = await searchStudentNotesTool.execute!({ query: 'Transportation bus', studentIdOrName: 'Marcus Aurelius' } as any, {}) as any;
        expect(result.message).toContain('Successfully retrieved');
        expect(result.notes?.length).toBeGreaterThan(0);
        expect(result.notes?.[0].content).toContain('transportation');
    });
});
