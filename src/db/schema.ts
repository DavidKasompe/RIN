import { pgTable, text, integer, real, timestamp, jsonb, boolean, vector } from 'drizzle-orm/pg-core';

// ─── Schools ─────────────────────────────────────────────────────────────────
export const schools = pgTable('schools', {
    id: text('id').primaryKey(), // We'll generate a unique ID like "sch_123"
    name: text('name').notNull(),
    inviteCode: text('invite_code').notNull().unique(), // e.g., "RIN-A1B2C3"
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
    role: text('role').notNull().default('educator'), // educator | administrator | counselor
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

