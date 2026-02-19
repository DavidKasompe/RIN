import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// db will be null if DATABASE_URL is not set — all DB operations should
// check this and fall back gracefully until the user configures their DB.
const sql = process.env.DATABASE_URL
    ? neon(process.env.DATABASE_URL)
    : null;

export const db = sql ? drizzle(sql, { schema }) : null;

export type DB = typeof db;
