import { createAuthClient } from 'better-auth/react';
import type { auth } from './auth';

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? 'http://localhost:3000',
});

// Define type based on server config so the frontend knows about `role` and `schoolId`
type AuthClient = typeof authClient;

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
