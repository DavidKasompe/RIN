'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

function ResetPasswordForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.password) newErrors.password = 'Required';
        else if (formData.password.length < 6) newErrors.password = 'Min. 6 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords don\'t match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsLoading(true);

        const { error } = await authClient.resetPassword({
            newPassword: formData.password,
        });

        setIsLoading(false);

        if (error) {
            setErrors({ form: error.message || 'Failed to reset password. Link may be expired.' });
            return;
        }

        // Success -> redirect to signin
        router.push('/signin?reset=success');
    };

    const inputStyle = (name: string) => ({
        width: '100%',
        padding: '13px 16px',
        fontSize: 15,
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: 12,
        border: `1.5px solid ${errors[name] ? '#c0392b' : focusedField === name ? '#800532' : 'rgba(35,6,3,0.12)'}`,
        backgroundColor: focusedField === name ? 'white' : 'rgba(255,255,255,0.7)',
        color: '#230603',
        outline: 'none',
        boxSizing: 'border-box' as const,
        transition: 'border-color 0.2s, background-color 0.2s',
    });

    return (
        <div style={{ width: '100%', maxWidth: 400 }}>
            {/* Heading */}
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
                <h1 style={{ fontSize: 30, fontWeight: 700, color: '#230603', margin: '0 0 8px', letterSpacing: '-1px' }}>
                    Set new password
                </h1>
                <p style={{ fontSize: 15, color: 'rgba(35,6,3,0.55)', margin: 0 }}>
                    Please choose a strong password
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Password */}
                <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#230603', marginBottom: 7, letterSpacing: '-0.2px' }}>
                        New Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        style={inputStyle('password')}
                    />
                    {errors.password
                        ? <p style={{ margin: '6px 0 0', fontSize: 13, color: '#c0392b' }}>{errors.password}</p>
                        : <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(35,6,3,0.38)' }}>Min. 6 characters</p>
                    }
                </div>

                {/* Confirm Password */}
                <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#230603', marginBottom: 7, letterSpacing: '-0.2px' }}>
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        style={inputStyle('confirmPassword')}
                    />
                    {errors.confirmPassword && (
                        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#c0392b' }}>{errors.confirmPassword}</p>
                    )}
                </div>

                {errors.form && (
                    <p style={{ margin: '0', fontSize: 13, color: '#c0392b', textAlign: 'center' }}>{errors.form}</p>
                )}

                {/* Submit */}
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
                    {isLoading ? 'Saving password…' : 'Save new password'}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
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

                <Suspense fallback={<div style={{ color: 'rgba(35,6,3,0.5)' }}>Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
