import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql as drizzleSql } from 'drizzle-orm';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function setup() {
    try {
        console.log('Ensuring pgvector extension exists...');
        await db.execute(drizzleSql`CREATE EXTENSION IF NOT EXISTS vector;`);
        console.log('Successfully created extension vector.');
    } catch (e) {
        console.error('Failed:', e);
    }
}

setup();
