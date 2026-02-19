import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import * as schema from '@/db/schema';

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET ?? 'dev-secret-change-in-production',
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',

    database: db
        ? drizzleAdapter(db, {
            provider: 'pg',
            schema: {
                user: schema.users,
                session: schema.sessions,
                account: schema.accounts,
                verification: schema.verifications,
            },
        })
        : undefined,

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },

    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24,      // refresh if older than 1 day
    },

    user: {
        additionalFields: {
            role: { type: 'string', defaultValue: 'educator' },
            school: { type: 'string', required: false },
        },
    },
});
