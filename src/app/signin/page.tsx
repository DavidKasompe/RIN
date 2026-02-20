'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
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
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'At least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    const { data, error } = await authClient.signIn.email({
      email: formData.email,
      password: formData.password,
    });

    setIsLoading(false);

    if (error) {
      setErrors({ email: error.message || 'Invalid email or password' });
      return;
    }

    router.push('/dashboard');
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAF3EC',
      display: 'flex',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Left panel — form */}
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

        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Heading */}
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: '#230603', margin: '0 0 8px', letterSpacing: '-1px' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(35,6,3,0.55)', margin: 0 }}>
              Sign in to your RIN account
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#230603', marginBottom: 7, letterSpacing: '-0.2px' }}>
                Email address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@school.edu"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                style={inputStyle('email')}
              />
              {errors.email && (
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#c0392b' }}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#230603', letterSpacing: '-0.2px' }}>
                  Password
                </label>
                <a href="#" style={{ fontSize: 13, color: '#800532', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot password?
                </a>
              </div>
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
              {errors.password && (
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#c0392b' }}>{errors.password}</p>
              )}
            </div>

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
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Footer links */}
          <p style={{ marginTop: 28, textAlign: 'center', fontSize: 14, color: 'rgba(35,6,3,0.5)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#800532', fontWeight: 600, textDecoration: 'none' }}>
              Sign up free
            </Link>
          </p>
          <p style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: 'rgba(35,6,3,0.35)' }}>
            <Link href="/terms" style={{ color: 'rgba(35,6,3,0.45)', textDecoration: 'none' }}>Terms of Service</Link>
            {' · '}
            <Link href="/privacy" style={{ color: 'rgba(35,6,3,0.45)', textDecoration: 'none' }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
