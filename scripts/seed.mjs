// scripts/seed.mjs  — run with: node scripts/seed.mjs
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Inline seed data so this script has no TS deps
const SEED_STUDENTS = [
    { id: 'seed-001', name: 'Marcus Thompson', studentId: 'ST-2024-001', grade: '10', subject: 'English', attendanceRate: 58, gpa: 1.4, assignmentCompletion: 42, behaviorReferrals: 4, lateSubmissions: 12, notes: 'Significant drop since October. Parents contacted, no response.', tags: ['At-Risk', 'ELL'], lastRiskScore: 87, lastRiskCategory: 'Critical' },
    { id: 'seed-002', name: 'Priya Sharma', studentId: 'ST-2024-002', grade: '11', subject: 'Mathematics', attendanceRate: 94, gpa: 3.8, assignmentCompletion: 97, behaviorReferrals: 0, lateSubmissions: 1, notes: 'Consistent high performer.', tags: [], lastRiskScore: 8, lastRiskCategory: 'Low' },
    { id: 'seed-003', name: 'Jerome Williams', studentId: 'ST-2024-003', grade: '9', subject: 'Science', attendanceRate: 72, gpa: 2.1, assignmentCompletion: 61, behaviorReferrals: 2, lateSubmissions: 7, notes: 'Attendance declining since January. Seems distracted.', tags: ['Monitored'], lastRiskScore: 63, lastRiskCategory: 'At Risk' },
    { id: 'seed-004', name: 'Sofia Mendez', studentId: 'ST-2024-004', grade: '12', subject: 'History', attendanceRate: 88, gpa: 3.2, assignmentCompletion: 82, behaviorReferrals: 0, lateSubmissions: 3, notes: 'Strong student, occasional late work.', tags: [], lastRiskScore: 22, lastRiskCategory: 'Low' },
    { id: 'seed-005', name: 'Damien Lee', studentId: 'ST-2024-005', grade: '10', subject: 'English', attendanceRate: 65, gpa: 1.8, assignmentCompletion: 55, behaviorReferrals: 3, lateSubmissions: 9, notes: 'IEP in place. Needs follow-up with special ed coordinator.', tags: ['IEP', 'At-Risk'], lastRiskScore: 79, lastRiskCategory: 'At Risk' },
    { id: 'seed-006', name: 'Aisha Johnson', studentId: 'ST-2024-006', grade: '11', subject: 'Mathematics', attendanceRate: 91, gpa: 2.9, assignmentCompletion: 78, behaviorReferrals: 1, lateSubmissions: 4, notes: 'GPA dropped from 3.4 last semester. Monitor closely.', tags: ['Monitored'], lastRiskScore: 41, lastRiskCategory: 'Moderate' },
    { id: 'seed-007', name: 'Carlos Rivera', studentId: 'ST-2024-007', grade: '9', subject: 'Science', attendanceRate: 79, gpa: 2.4, assignmentCompletion: 68, behaviorReferrals: 1, lateSubmissions: 5, notes: '', tags: [], lastRiskScore: 48, lastRiskCategory: 'Moderate' },
    { id: 'seed-008', name: 'Lily Chen', studentId: 'ST-2024-008', grade: '12', subject: 'History', attendanceRate: 96, gpa: 4.0, assignmentCompletion: 100, behaviorReferrals: 0, lateSubmissions: 0, notes: 'Class valedictorian candidate.', tags: [], lastRiskScore: 3, lastRiskCategory: 'Low' },
    { id: 'seed-009', name: 'Malik Brown', studentId: 'ST-2024-009', grade: '10', subject: 'English', attendanceRate: 48, gpa: 1.1, assignmentCompletion: 31, behaviorReferrals: 6, lateSubmissions: 18, notes: 'Crisis level. Multiple office referrals. Parents meeting scheduled.', tags: ['At-Risk', '504'], lastRiskScore: 95, lastRiskCategory: 'Critical' },
    { id: 'seed-010', name: 'Emma Rodriguez', studentId: 'ST-2024-010', grade: '11', subject: 'Mathematics', attendanceRate: 85, gpa: 3.1, assignmentCompletion: 87, behaviorReferrals: 0, lateSubmissions: 2, notes: 'Improving trend this semester.', tags: [], lastRiskScore: 19, lastRiskCategory: 'Low' },
    { id: 'seed-011', name: 'Noah Patel', studentId: 'ST-2024-011', grade: '9', subject: 'Science', attendanceRate: 76, gpa: 2.6, assignmentCompletion: 71, behaviorReferrals: 1, lateSubmissions: 6, notes: 'New student, still adjusting.', tags: ['ELL'], lastRiskScore: 44, lastRiskCategory: 'Moderate' },
    { id: 'seed-012', name: 'Grace Kim', studentId: 'ST-2024-012', grade: '12', subject: 'History', attendanceRate: 90, gpa: 3.5, assignmentCompletion: 91, behaviorReferrals: 0, lateSubmissions: 1, notes: 'Excellent participation and class engagement.', tags: [], lastRiskScore: 12, lastRiskCategory: 'Low' },
];

const DEMO_USER_ID = 'demo-user-seed';

async function seed() {
    console.log('Seeding database...');

    // 1. Upsert a demo user (required for FK constraint on students.user_id)
    await sql`
    INSERT INTO users (id, name, email, email_verified, role, school, created_at, updated_at)
    VALUES (
      ${DEMO_USER_ID},
      'Demo Educator',
      'demo@rin.app',
      true,
      'educator',
      'Lincoln High School',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
  `;
    console.log('  ✓ Demo user upserted');

    // 2. Upsert all 12 seed students
    for (const s of SEED_STUDENTS) {
        await sql`
      INSERT INTO students (
        id, user_id, name, student_id, grade, subject,
        attendance_rate, gpa, assignment_completion,
        behavior_referrals, late_submissions,
        notes, tags,
        last_risk_score, last_risk_category, last_analyzed_at,
        created_at, updated_at
      ) VALUES (
        ${s.id}, ${DEMO_USER_ID}, ${s.name}, ${s.studentId}, ${s.grade}, ${s.subject},
        ${s.attendanceRate}, ${s.gpa}, ${s.assignmentCompletion},
        ${s.behaviorReferrals}, ${s.lateSubmissions},
        ${s.notes}, ${JSON.stringify(s.tags)},
        ${s.lastRiskScore}, ${s.lastRiskCategory}, NOW(),
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        attendance_rate = EXCLUDED.attendance_rate,
        gpa = EXCLUDED.gpa,
        last_risk_score = EXCLUDED.last_risk_score,
        last_risk_category = EXCLUDED.last_risk_category,
        updated_at = NOW()
    `;
        console.log(`  ✓ ${s.name}`);
    }

    // 3. Seed sample calendar events
    const today = new Date();
    const events = [
        { id: 'ev-seed-1', title: 'Parent Meeting — Marcus Thompson', type: 'meeting', date: new Date(today.getFullYear(), today.getMonth(), 8), studentId: 'seed-001' },
        { id: 'ev-seed-2', title: 'Intervention Check-in — Jerome', type: 'intervention', date: new Date(today.getFullYear(), today.getMonth(), 12), studentId: 'seed-003' },
        { id: 'ev-seed-3', title: 'Semester Assessment', type: 'assessment', date: new Date(today.getFullYear(), today.getMonth(), 15), studentId: null },
        { id: 'ev-seed-4', title: 'Follow-up — Damien Lee', type: 'followup', date: new Date(today.getFullYear(), today.getMonth(), 20), studentId: 'seed-005' },
        { id: 'ev-seed-5', title: 'Parent Meeting — Malik Brown', type: 'meeting', date: new Date(today.getFullYear(), today.getMonth(), 22), studentId: 'seed-009' },
    ];

    for (const ev of events) {
        await sql`
      INSERT INTO calendar_events (id, user_id, title, type, date, student_id, created_at)
      VALUES (${ev.id}, ${DEMO_USER_ID}, ${ev.title}, ${ev.type}, ${ev.date.toISOString()}, ${ev.studentId}, NOW())
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title
    `;
        console.log(`  ✓ Event: ${ev.title}`);
    }

    console.log('\nSeed complete!');
    process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
