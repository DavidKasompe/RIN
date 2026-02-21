import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
    console.log('Seeding mock data for Mastra testing...');

    try {
        // 1. School
        const schoolId = 'sch_mock_123';
        await db.insert(schema.schools).values({
            id: schoolId,
            name: 'Mock High School',
            inviteCode: 'MOCK-123',
        }).onConflictDoNothing();

        // 2. User
        const userId = 'usr_mock_123';
        await db.insert(schema.users).values({
            id: userId,
            name: 'Mock Teacher',
            email: 'teacher@mock.edu',
            role: 'educator',
            schoolId,
        }).onConflictDoNothing();

        // 3. Students
        const mockStudents = [
            {
                id: 'stu_mock_marcus',
                userId,
                name: 'Marcus Aurelius',
                studentId: 'STU-123',
                grade: '10th',
                subject: 'History',
                attendanceRate: 85.0,
                gpa: 2.8,
                assignmentCompletion: 70.0,
                behaviorReferrals: 3,
                lateSubmissions: 5,
                lastRiskScore: 78.5,
                lastRiskCategory: 'At Risk',
                notes: 'Marcus is a bright student but has been struggling recently.',
            },
            {
                id: 'stu_mock_sarah',
                userId,
                name: 'Sarah Connor',
                studentId: 'STU-124',
                grade: '11th',
                subject: 'Math',
                attendanceRate: 98.0,
                gpa: 3.9,
                assignmentCompletion: 95.0,
                behaviorReferrals: 0,
                lateSubmissions: 1,
                lastRiskScore: 12.0,
                lastRiskCategory: 'Low',
                notes: 'Excellent student, highly engaged.',
            },
            {
                id: 'stu_mock_john',
                userId,
                name: 'John Smith',
                studentId: 'STU-125',
                grade: '9th',
                subject: 'English',
                attendanceRate: 72.0,
                gpa: 1.5,
                assignmentCompletion: 45.0,
                behaviorReferrals: 8,
                lateSubmissions: 12,
                lastRiskScore: 92.5,
                lastRiskCategory: 'Critical',
                notes: 'Frequent absences and behavioral issues.',
            },
            {
                id: 'stu_mock_emily',
                userId,
                name: 'Emily Chen',
                studentId: 'STU-126',
                grade: '10th',
                subject: 'Science',
                attendanceRate: 92.0,
                gpa: 3.2,
                assignmentCompletion: 88.0,
                behaviorReferrals: 1,
                lateSubmissions: 2,
                lastRiskScore: 25.0,
                lastRiskCategory: 'Low',
                notes: 'Solid performance, occasional late work.',
            },
            {
                id: 'stu_mock_miguel',
                userId,
                name: 'Miguel Rodriguez',
                studentId: 'STU-127',
                grade: '12th',
                subject: 'Art',
                attendanceRate: 88.0,
                gpa: 2.5,
                assignmentCompletion: 60.0,
                behaviorReferrals: 2,
                lateSubmissions: 7,
                lastRiskScore: 45.0,
                lastRiskCategory: 'Moderate',
                notes: 'Creative but needs support with deadlines.',
            }
        ];

        for (const stu of mockStudents) {
            await db.insert(schema.students).values(stu).onConflictDoNothing();
        }
        
        // 4. Analysis (Active Plan)
        await db.insert(schema.analyses).values({
            id: 'ana_mock_marcus_1',
            studentId: 'stu_mock_marcus',
            userId,
            riskScore: 78.5,
            category: 'At Risk',
            confidence: 0.9,
            summary: 'Marcus shows declining attendance and grades.',
            interventionPlan: '1. Schedule parent-teacher meeting.\n2. Weekly attendance check-ins.',
        }).onConflictDoNothing();

        // 5. Calendar Events
        await db.insert(schema.calendarEvents).values({
            id: 'evt_mock_marcus_1',
            userId,
            studentId: 'stu_mock_marcus',
            title: 'Meeting with Marcus parents',
            type: 'meeting',
            date: new Date(),
        }).onConflictDoNothing();

        // 6. Student Notes (Mock Embedding)
        // Note: For searching via cosine similarity, any vector against an identical vector gives high similarity.
        const mockEmbedding = Array(1536).fill(0.01);
        await db.insert(schema.studentNotes).values({
            id: 'not_mock_marcus_1',
            studentId: 'stu_mock_marcus',
            authorId: userId,
            content: 'Marcus missed class on Friday because he missed the bus. transportation issues seem to be recurring.',
            type: 'general',
            embedding: mockEmbedding,
        }).onConflictDoUpdate({
            target: schema.studentNotes.id,
            set: { content: 'Marcus missed class on Friday because he missed the bus. transportation issues seem to be recurring.' }
        });

        console.log('Seed complete!');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
