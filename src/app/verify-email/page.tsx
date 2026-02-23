'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function VerifyEmailPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleResend = async () => {
        setIsLoading(true);
        setMessage('');
        setError('');

        // To resend the verification email we need the user's email, or we rely on the session
        // In BetterAuth, if a user isn't verified, they can still sign in and get a session with { verified: false }
        // We can fetch the session to get the email automatically.
        const { data: sessionData } = await authClient.getSession();

        if (!sessionData?.user?.email) {
            setError('Could not find your email session. Please sign in again.');
            setIsLoading(false);
            return;
        }

        const { error: reqError } = await authClient.sendVerificationEmail({
            email: sessionData.user.email,
        });

        setIsLoading(false);

        if (reqError) {
            setError(reqError.message || 'Failed to resend. Please try again later.');
        } else {
            setMessage(`A new verification link has been sent to ${sessionData.user.email}.`);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#FAF3EC',
            display: 'flex',
            fontFamily: 'Inter, system-ui, sans-serif',
        }}>
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 28px',
                maxWidth: 520,
                margin: '0 auto',
            }}>
                {/* Logo */}
                <Link href="/" style={{ textDecoration: 'none', marginBottom: 48, display: 'block' }}>
                    <span style={{
                        fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
                        fontSize: 28,
                        fontWeight: 800,
                        color: '#800532',
                        letterSpacing: '-1.5px',
                    }}>
                        RIN
                    </span>
                </Link>

                <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
                    <div style={{ marginBottom: 32 }}>
                        <h1 style={{ fontSize: 30, fontWeight: 700, color: '#230603', margin: '0 0 12px', letterSpacing: '-1px' }}>
                            Check your inbox
                        </h1>
                        <p style={{ fontSize: 16, color: 'rgba(35,6,3,0.6)', margin: 0, lineHeight: 1.5 }}>
                            We've sent a verification link to your email address.
                            Please click the link inside to verify your account and continue.
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid rgba(35, 6, 3, 0.1)',
                        borderRadius: 16,
                        padding: 32,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16
                    }}>
                        {message && <p style={{ fontSize: 14, color: '#058050', margin: 0, fontWeight: 500 }}>{message}</p>}
                        {error && <p style={{ fontSize: 14, color: '#c0392b', margin: 0, fontWeight: 500 }}>{error}</p>}

                        <button
                            onClick={handleResend}
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                fontSize: 15,
                                fontWeight: 600,
                                fontFamily: 'Inter, system-ui, sans-serif',
                                borderRadius: 12,
                                border: 'none',
                                backgroundColor: isLoading ? 'rgba(128,5,50,0.6)' : '#800532',
                                color: 'white',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                letterSpacing: '-0.3px',
                                transition: 'opacity 0.2s',
                            }}
                        >
                            {isLoading ? 'Sending…' : 'Resend verification email'}
                        </button>
                        <button
                            onClick={() => router.push('/signin')}
                            style={{
                                width: '100%',
                                padding: '14px',
                                fontSize: 15,
                                fontWeight: 600,
                                fontFamily: 'Inter, system-ui, sans-serif',
                                borderRadius: 12,
                                border: '1px solid rgba(35,6,3,0.1)',
                                backgroundColor: 'white',
                                color: '#230603',
                                cursor: 'pointer',
                                letterSpacing: '-0.3px',
                            }}
                        >
                            Back to Sign in
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
