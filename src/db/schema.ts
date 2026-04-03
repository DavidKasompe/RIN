import { pgTable, text, integer, real, timestamp, jsonb, boolean, vector } from 'drizzle-orm/pg-core';

// ─── Schools ─────────────────────────────────────────────────────────────────
export const schools = pgTable('schools', {
    id: text('id').primaryKey(), // We'll generate a unique ID like "sch_123"
    name: text('name').notNull(),
    inviteCode: text('invite_code').notNull().unique(), // e.g., "RIN-A1B2C3"
    institutionType: text('institution_type').notNull().default('k12'), // 'k12' | 'university'
    country: text('country'),
    academicSystem: text('academic_system'), // 'semester' | 'trimester' | 'term'
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Users (better-auth compatible) ─────────────────────────────────────────
export const users = pgTable('users', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    // K-12: 'educator' | 'counselor' | 'administrator'
    // University: 'lecturer' | 'academic_advisor' | 'dean' | 'registrar' | 'administrator'
    role: text('role').notNull().default('educator'),
    institutionType: text('institution_type').default('k12'),
    schoolId: text('school_id').references(() => schools.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── User Schools (Many-to-Many Workspaces) ──────────────────────────────────
export const userSchools = pgTable('user_schools', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('educator'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Sessions (better-auth) ──────────────────────────────────────────────────
export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Accounts (better-auth) ──────────────────────────────────────────────────
export const accounts = pgTable('accounts', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Verifications (better-auth) ─────────────────────────────────────────────
export const verifications = pgTable('verifications', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── University: Faculties ────────────────────────────────────────────────────
export const faculties = pgTable('faculties', {
    id: text('id').primaryKey(),
    schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // e.g. "Faculty of Engineering"
    code: text('code'), // e.g. "FENG"
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── University: Departments ──────────────────────────────────────────────────
export const departments = pgTable('departments', {
    id: text('id').primaryKey(),
    facultyId: text('faculty_id').notNull().references(() => faculties.id, { onDelete: 'cascade' }),
    schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // e.g. "Computer Science"
    code: text('code'), // e.g. "CS"
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── University: Programs ─────────────────────────────────────────────────────
export const programs = pgTable('programs', {
    id: text('id').primaryKey(),
    departmentId: text('department_id').references(() => departments.id, { onDelete: 'set null' }),
    schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // e.g. "BSc Software Engineering"
    code: text('code'), // e.g. "BSC-SE"
    degreeType: text('degree_type'), // 'bachelors' | 'masters' | 'phd' | 'diploma' | 'certificate'
    durationYears: integer('duration_years'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Student Cohorts (K-12 classes & University cohorts) ─────────────────────
export const studentCohorts = pgTable('student_cohorts', {
    id: text('id').primaryKey(),
    schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    programId: text('program_id').references(() => programs.id, { onDelete: 'set null' }),
    name: text('name').notNull(), // e.g. "2023 Intake" or "Grade 10A"
    yearLevel: text('year_level'), // e.g. "Year 2" / "Grade 10" / "Level 200"
    stream: text('stream'), // K-12: 'science' | 'arts' | 'commerce' | 'technical'
    type: text('type').notNull().default('class'), // 'class' (k12) | 'cohort' (university)
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Students ────────────────────────────────────────────────────────────────
export const students = pgTable('students', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    schoolId: text('school_id').references(() => schools.id, { onDelete: 'cascade' }),

    // Identity
    name: text('name').notNull(),
    studentId: text('student_id').notNull(),
    email: text('email'),
    grade: text('grade').notNull(),
    subject: text('subject'),

    // Parent / Guardian info
    parentName: text('parent_name'),
    parentEmail: text('parent_email'),
    parentPhone: text('parent_phone'),

    // Academic indicators
    attendanceRate: real('attendance_rate').notNull().default(100),
    gpa: real('gpa').notNull().default(4.0),
    assignmentCompletion: real('assignment_completion').notNull().default(100),

    // Behavioral indicators
    behaviorReferrals: integer('behavior_referrals').notNull().default(0),
    lateSubmissions: integer('late_submissions').notNull().default(0),

    // Notes & tags
    notes: text('notes'),
    tags: jsonb('tags').$type<string[]>().default([]),

    // Auto-computed from analyses
    lastRiskScore: real('last_risk_score'),
    lastRiskCategory: text('last_risk_category'), // Low | Moderate | At Risk | Critical
    lastAnalyzedAt: timestamp('last_analyzed_at'),

    // Institution split fields
    institutionType: text('institution_type').default('k12'),
    cohortId: text('cohort_id').references(() => studentCohorts.id, { onDelete: 'set null' }),
    programId: text('program_id').references(() => programs.id, { onDelete: 'set null' }),
    facultyId: text('faculty_id').references(() => faculties.id, { onDelete: 'set null' }),
    studentLevel: text('student_level'), // 'Year 1' / 'Level 100' / 'Grade 9'
    stream: text('stream'), // K-12 stream e.g. 'science'
    studyMode: text('study_mode'), // university: 'full-time' | 'part-time' | 'distance'
    enrollmentStatus: text('enrollment_status').default('active'), // 'active' | 'deferred' | 'suspended' | 'graduated' | 'withdrawn'
    matricNumber: text('matric_number'), // university student number

    // Moodle linkage
    moodleUserId: integer('moodle_user_id'),
    moodleCourseIds: jsonb('moodle_course_ids').$type<number[]>().default([]),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Analyses ────────────────────────────────────────────────────────────────
export const analyses = pgTable('analyses', {
    id: text('id').primaryKey(),
    studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    riskScore: real('risk_score').notNull(),
    category: text('category').notNull(),
    confidence: real('confidence').notNull(),
    factors: jsonb('factors').$type<string[]>().notNull().default([]),
    summary: text('summary').notNull(),
    interventionPlan: text('intervention_plan'),
    parentLetter: text('parent_letter'),

    // Embedding vector stored as JSON array for RAG
    embedding: jsonb('embedding').$type<number[]>(),

    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Chat Sessions ───────────────────────────────────────────────────────────
export const chatSessions = pgTable('chat_sessions', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    studentId: text('student_id').references(() => students.id, { onDelete: 'set null' }),
    title: text('title').notNull().default('New Chat'),
    messages: jsonb('messages').$type<{ role: string; content: string; timestamp: string }[]>().notNull().default([]),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Calendar Events ─────────────────────────────────────────────────────────
export const calendarEvents = pgTable('calendar_events', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    studentId: text('student_id').references(() => students.id, { onDelete: 'set null' }),

    title: text('title').notNull(),
    type: text('type').notNull().default('meeting'), // meeting | intervention | assessment | followup
    date: timestamp('date').notNull(),
    endDate: timestamp('end_date'),
    notes: text('notes'),
    completed: boolean('completed').notNull().default(false),

    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Workflows (Visual Builder) ───────────────────────────────────────────────
export const workflows = pgTable('workflows', {
    id: text('id').primaryKey(), // Generated like wf_123
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    schoolId: text('school_id').references(() => schools.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    active: boolean('active').notNull().default(false),

    // React Flow JSON State
    nodes: jsonb('nodes').$type<Record<string, any>[]>().notNull().default([]),
    edges: jsonb('edges').$type<Record<string, any>[]>().notNull().default([]),

    // Execution metrics
    triggerConfig: jsonb('trigger_config').$type<Record<string, any>>(),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Workflow Executions ─────────────────────────────────────────────────────
export const workflowExecutions = pgTable('workflow_executions', {
    id: text('id').primaryKey(),
    workflowId: text('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('running'), // running | success | failed
    triggerData: jsonb('trigger_data').$type<Record<string, any>>(),
    result: jsonb('result').$type<Record<string, any>>(),
    error: text('error'),

    startedAt: timestamp('started_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
});

// ─── Workflow Execution Logs ─────────────────────────────────────────────────
export const workflowExecutionLogs = pgTable('workflow_execution_logs', {
    id: text('id').primaryKey(),
    executionId: text('execution_id').notNull().references(() => workflowExecutions.id, { onDelete: 'cascade' }),
    nodeId: text('node_id').notNull(),
    nodeName: text('node_name'),
    nodeType: text('node_type'),
    status: text('status').notNull(), // success | failed
    logs: jsonb('logs').$type<Record<string, any>>(),
    error: text('error'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Student Notes (For RAG) ──────────────────────────────────────────────────
export const studentNotes = pgTable('student_notes', {
    id: text('id').primaryKey(),
    studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    // The qualitative content (e.g. counselor notes, IEP summary)
    content: text('content').notNull(),
    type: text('type').notNull().default('general'), // general | meeting | iep | disciplinary | document

    // Tags and visibility for case notes
    tags: jsonb('tags').$type<string[]>().default([]),
    visibility: text('visibility').notNull().default('private'), // 'private' | 'team'

    // Source document reference (for document-chunk notes)
    sourceDocId: text('source_doc_id'),

    // Vector embedding for semantic search
    embedding: vector('embedding', { dimensions: 1536 }), // OpenAI text-embedding-3-small

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Student Documents (uploaded transcripts, IEPs, records) ─────────────────
export const studentDocuments = pgTable('student_documents', {
    id: text('id').primaryKey(),
    studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    uploadedBy: text('uploaded_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
    filename: text('filename').notNull(),        // original filename displayed in UI
    storageKey: text('storage_key').notNull(),   // path in Supabase Storage bucket
    publicUrl: text('public_url').notNull(),
    type: text('type').notNull(),               // 'pdf' | 'docx' | 'txt'
    sizeBytes: integer('size_bytes').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Artifacts (AI-generated reports & slides) ───────────────────────────────
export const artifacts = pgTable('artifacts', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    title: text('title').notNull(),
    type: text('type').notNull().$type<'pdf' | 'pptx'>(), // 'pdf' | 'pptx'
    publicUrl: text('public_url').notNull(),

    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Interventions ────────────────────────────────────────────────────────────
export const interventions = pgTable("interventions", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  counselorId: text("counselor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'meeting' | 'phone_call' | 'email' | 'referral' | 'mentoring'
  notes: text("notes"),
  outcome: text("outcome"), // 'positive' | 'neutral' | 'escalated' | 'pending'
  followUpDate: timestamp("follow_up_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Early Warnings ───────────────────────────────────────────────────────────
export const earlyWarnings = pgTable("early_warnings", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  triggeredBy: text("triggered_by").notNull(), // 'risk_score' | 'attendance' | 'gpa' | 'behavior'
  threshold: real("threshold").notNull(), // the value that triggered the alert
  message: text("message").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Moodle Connections ───────────────────────────────────────────────────────
export const moodleConnections = pgTable('moodle_connections', {
    id: text('id').primaryKey(),
    schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    moodleUrl: text('moodle_url').notNull(),
    moodleToken: text('moodle_token').notNull(), // stored; in production should be encrypted
    lastSyncedAt: timestamp('last_synced_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Plagiarism Results ───────────────────────────────────────────────────────
export const plagiarismResults = pgTable('plagiarism_results', {
    id: text('id').primaryKey(),
    schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    assignmentId: text('assignment_id').notNull(), // Moodle assignment ID
    submissionId: text('submission_id').notNull(), // Moodle submission ID
    submissionText: text('submission_text').notNull(),
    similarityScore: real('similarity_score').notNull(), // 0.0 – 1.0
    flagged: boolean('flagged').notNull().default(false),
    flagReason: text('flag_reason'), // 'peer_similarity' | 'self_plagiarism'
    matchedSources: jsonb('matched_sources').$type<{ source: string; score: number; excerpt: string }[]>().default([]),
    checkedAt: timestamp('checked_at').notNull().defaultNow(),
    status: text('status').notNull().default('pending'), // 'pending' | 'clean' | 'flagged' | 'reviewed' | 'dismissed'
    reviewedBy: text('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
    reviewedAt: timestamp('reviewed_at'),
});

// ─── Timetable Slots ──────────────────────────────────────────────────────────
export const timetableSlots = pgTable('timetable_slots', {
    id: text('id').primaryKey(),
    schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    dayOfWeek: integer('day_of_week').notNull(), // 0=Monday … 4=Friday
    startTime: text('start_time').notNull(), // 'HH:MM'
    endTime: text('end_time').notNull(), // 'HH:MM'
    slotLabel: text('slot_label'), // 'Period 1' | 'Morning Lecture'
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Timetable Entries ────────────────────────────────────────────────────────
export const timetableEntries = pgTable('timetable_entries', {
    id: text('id').primaryKey(),
    schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    slotId: text('slot_id').notNull().references(() => timetableSlots.id, { onDelete: 'cascade' }),
    cohortId: text('cohort_id').references(() => studentCohorts.id, { onDelete: 'set null' }),
    programId: text('program_id').references(() => programs.id, { onDelete: 'set null' }),
    subject: text('subject').notNull(), // 'Mathematics' | 'CS101'
    teacherId: text('teacher_id').references(() => users.id, { onDelete: 'set null' }),
    room: text('room'),
    location: text('location'),
    // University-specific: room constraints (per coworker feedback)
    classType: text('class_type'), // 'lecture' | 'lab' | 'tutorial' | 'seminar' | 'practical'
    roomCapacity: integer('room_capacity'), // max students the room holds
    studentCount: integer('student_count'), // expected number of students
    recurring: boolean('recurring').default(true),
    termStart: timestamp('term_start'),
    termEnd: timestamp('term_end'),
    googleEventId: text('google_event_id'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Student Timetables (individual overrides) ────────────────────────────────
export const studentTimetables = pgTable('student_timetables', {
    id: text('id').primaryKey(),
    studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    timetableEntryId: text('timetable_entry_id').references(() => timetableEntries.id, { onDelete: 'cascade' }),
    enrolled: boolean('enrolled').default(true),
    notes: text('notes'),
});
