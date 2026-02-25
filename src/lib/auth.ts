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

    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        async sendVerificationEmail({ user, url }: { user: any; url: string }) {
            const { Resend } = await import('resend');
            const resend = new Resend(process.env.RESEND_API_KEY!);
            
            // Extract token from Better Auth's backend URL and point to our custom frontend page
            const parsed = new URL(url);
            const token = parsed.searchParams.get('token');
            const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000';
            const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

            const { data, error } = await resend.emails.send({
                from: 'RIN Security <noreply@withrin.co>',
                to: user.email,
                subject: 'Verify your email address - RIN',
                html: `<p>Hi ${user.name},</p><p>Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">Verify Email</a></p><p>If you did not request this, please ignore this email.</p>`,
            });

            if (error) {
                console.error('❌ Resend Error (Verification):', error);
            } else {
                console.log('✅ Verification email sent:', data);
            }
        },
    },

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        async sendResetPassword({ user, url }: { user: any; url: string }) {
            const { Resend } = await import('resend');
            const resend = new Resend(process.env.RESEND_API_KEY!);
            const { data, error } = await resend.emails.send({
                from: 'RIN Security <noreply@withrin.co>',
                to: user.email,
                subject: 'Reset your password - RIN',
                html: `<p>Hi ${user.name},</p><p>You requested to reset your password. Click the link below to set a new password:</p><p><a href="${url}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p>`,
            });

            if (error) {
                console.error('❌ Resend Error (Password Reset):', error);
            } else {
                console.log('✅ Password reset email sent:', data);
            }
        },
    },

    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24,      // refresh if older than 1 day
    },

    user: {
        additionalFields: {
            role: { type: 'string', defaultValue: 'educator' },
            schoolId: { type: 'string', required: false },
        },
    },
});
