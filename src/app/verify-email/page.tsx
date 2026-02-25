'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [isLoading, setIsLoading] = useState(false);
    const [verifying, setVerifying] = useState(!!token);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            setVerifying(true);
            authClient.verifyEmail({
                query: { token }
            }).then((res) => {
                if (res.error) {
                    setError(res.error.message || 'Verification failed. The link may have expired.');
                } else {
                    setMessage('Your email has been successfully verified!');
                    setTimeout(() => {
                        router.push('/dashboard');
                    }, 2000);
                }
            }).catch(() => {
                setError('An unexpected error occurred during verification.');
            }).finally(() => {
                setVerifying(false);
            });
        }
    }, [token, router]);

    const handleResend = async () => {
        setIsLoading(true);
        setMessage('');
        setError('');

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
            // Clear the token from the URL so we are back in the "Check your inbox" state
            router.replace('/verify-email');
            setVerifying(false);
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
                            {verifying ? 'Verifying your email...' : (token && !error && !message ? 'Verifying...' : (message === 'Your email has been successfully verified!' ? 'Email Verified' : 'Check your inbox'))}
                        </h1>
                        <p style={{ fontSize: 16, color: 'rgba(35,6,3,0.6)', margin: 0, lineHeight: 1.5 }}>
                            {verifying ? 'Please wait while we confirm your email address.' : (
                                message === 'Your email has been successfully verified!'
                                    ? 'Redirecting you to the dashboard...'
                                    : "We've sent a verification link to your email address. Please click the link inside to verify your account and continue."
                            )}
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
                            disabled={isLoading || verifying}
                            style={{
                                width: '100%',
                                padding: '14px',
                                fontSize: 15,
                                fontWeight: 600,
                                fontFamily: 'Inter, system-ui, sans-serif',
                                borderRadius: 12,
                                border: 'none',
                                backgroundColor: isLoading || verifying ? 'rgba(128,5,50,0.6)' : '#800532',
                                color: 'white',
                                cursor: isLoading || verifying ? 'not-allowed' : 'pointer',
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

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#FAF3EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
