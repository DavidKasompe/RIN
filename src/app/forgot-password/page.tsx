'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError('');

        const { error: reqError } = await authClient.forgetPassword({
            email,
            redirectTo: '/reset-password',
        });

        setIsLoading(false);

        if (reqError) {
            setError(reqError.message || 'Something went wrong. Please try again.');
            return;
        }

        setIsSuccess(true);
    };

    const inputStyle = {
        width: '100%',
        padding: '13px 16px',
        fontSize: 15,
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: 12,
        border: `1.5px solid ${error ? '#c0392b' : focusedField === 'email' ? '#800532' : 'rgba(35,6,3,0.12)'}`,
        backgroundColor: focusedField === 'email' ? 'white' : 'rgba(255,255,255,0.7)',
        color: '#230603',
        outline: 'none',
        boxSizing: 'border-box' as const,
        transition: 'border-color 0.2s, background-color 0.2s',
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

                <div style={{ width: '100%', maxWidth: 400 }}>
                    <div style={{ marginBottom: 32, textAlign: 'center' }}>
                        <h1 style={{ fontSize: 30, fontWeight: 700, color: '#230603', margin: '0 0 8px', letterSpacing: '-1px' }}>
                            Reset password
                        </h1>
                        <p style={{ fontSize: 15, color: 'rgba(35,6,3,0.55)', margin: 0 }}>
                            Enter your email and we'll send a reset link
                        </p>
                    </div>

                    {isSuccess ? (
                        <div style={{
                            backgroundColor: 'rgba(5, 128, 80, 0.08)',
                            border: '1px solid rgba(5, 128, 80, 0.2)',
                            borderRadius: 12,
                            padding: 24,
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: 15, color: '#058050', margin: '0 0 16px', fontWeight: 500, lineHeight: 1.5 }}>
                                We've sent a password reset link to <strong>{email}</strong>.
                            </p>
                            <p style={{ fontSize: 14, color: 'rgba(5, 128, 80, 0.7)', margin: 0 }}>
                                Please check your inbox (and spam folder) for the next steps.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#230603', marginBottom: 7, letterSpacing: '-0.2px' }}>
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@school.edu"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (error) setError('');
                                    }}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    style={inputStyle}
                                />
                                {error && (
                                    <p style={{ margin: '6px 0 0', fontSize: 13, color: '#c0392b' }}>{error}</p>
                                )}
                            </div>

                            <button
                                type="submit"
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
                                    marginTop: 4,
                                }}
                            >
                                {isLoading ? 'Sending link…' : 'Send reset link'}
                            </button>
                        </form>
                    )}

                    <p style={{ marginTop: 28, textAlign: 'center', fontSize: 14, color: 'rgba(35,6,3,0.5)' }}>
                        Remember your password?{' '}
                        <Link href="/signin" style={{ color: '#800532', fontWeight: 600, textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
