'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

const ROLES = [
  { value: 'educator', label: 'Educator / Teacher' },
  { value: 'administrator', label: 'School Administrator' },
  { value: 'advisor', label: 'Academic Advisor / Counselor' },
];

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'educator', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
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

    const { data, error } = await authClient.signUp.email({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      role: formData.role,
    } as any);

    setIsLoading(false);

    if (error) {
      const errMsg = error.message?.toLowerCase() || '';
      if (errMsg.includes('exist') || error.code === 'user_already_exists') {
        authClient.sendVerificationEmail({ email: formData.email }).catch(() => {});
        setErrors({ email: 'Account already exists. If not verified, a new verification link was sent to your inbox.' });
      } else {
        setErrors({ email: error.message || 'Signup failed' });
      }
      return;
    }

    // Success -> Redirect to verification notice
    router.push('/verify-email');
  };

  const inputStyle = (name: string) => ({
    width: '100%',
    padding: '12px 14px',
    fontSize: 14,
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: 10,
    border: `1.5px solid ${errors[name] ? '#c0392b' : focusedField === name ? '#800532' : 'rgba(35,6,3,0.12)'}`,
    backgroundColor: focusedField === name ? 'white' : 'rgba(255,255,255,0.7)',
    color: '#230603',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s, background-color 0.2s',
  });

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#230603',
    marginBottom: 6,
    letterSpacing: '-0.1px',
  } as const;

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
        width: '100%',
        maxWidth: 560,
        margin: '0 auto',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', marginBottom: 36, display: 'block' }}>
          <span style={{
            fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
            fontSize: 28, fontWeight: 800, color: '#800532', letterSpacing: '-1.5px',
          }}>RIN</span>
        </Link>

        <div style={{ width: '100%' }}>
          {/* Heading — centered */}
          <div style={{ marginBottom: 28, textAlign: 'center' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#230603', margin: '0 0 7px', letterSpacing: '-1px' }}>
              Create your account
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(35,6,3,0.5)', margin: 0 }}>
              Free for K–12 educators. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Row 1 — Name + Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Full name</label>
                <input
                  type="text" name="name" placeholder="Jane Smith"
                  value={formData.name} onChange={handleChange}
                  onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                  style={inputStyle('name')}
                />
                {errors.name && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#c0392b' }}>{errors.name}</p>}
              </div>
              <div>
                <label style={labelStyle}>Work email</label>
                <input
                  type="email" name="email" placeholder="you@school.edu"
                  value={formData.email} onChange={handleChange}
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                  style={inputStyle('email')}
                />
                {errors.email && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#c0392b' }}>{errors.email}</p>}
              </div>
            </div>

            {/* Row 2 — Role (full width) */}
            <div>
              <label style={labelStyle}>Your role</label>
              <select
                name="role" value={formData.role} onChange={handleChange}
                onFocus={() => setFocusedField('role')} onBlur={() => setFocusedField(null)}
                style={{
                  ...inputStyle('role'),
                  appearance: 'none' as const,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23800532' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  paddingRight: 40,
                  cursor: 'pointer',
                }}
              >
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            {/* Row 3 — Password + Confirm */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password" name="password" placeholder="••••••••"
                  value={formData.password} onChange={handleChange}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                  style={inputStyle('password')}
                />
                {errors.password
                  ? <p style={{ margin: '5px 0 0', fontSize: 12, color: '#c0392b' }}>{errors.password}</p>
                  : <p style={{ margin: '5px 0 0', fontSize: 12, color: 'rgba(35,6,3,0.38)' }}>Min. 6 characters</p>
                }
              </div>
              <div>
                <label style={labelStyle}>Confirm password</label>
                <input
                  type="password" name="confirmPassword" placeholder="••••••••"
                  value={formData.confirmPassword} onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)}
                  style={inputStyle('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p style={{ margin: '5px 0 0', fontSize: 12, color: '#c0392b' }}>{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms */}
            <p style={{ fontSize: 12, color: 'rgba(35,6,3,0.42)', margin: '2px 0 0', lineHeight: 1.5 }}>
              By creating an account you agree to our{' '}
              <Link href="/terms" style={{ color: '#800532', textDecoration: 'none', fontWeight: 500 }}>Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" style={{ color: '#800532', textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</Link>.
            </p>

            {/* Submit */}
            <button
              type="submit" disabled={isLoading}
              style={{
                width: '100%', padding: '13px',
                fontSize: 15, fontWeight: 600,
                fontFamily: 'Inter, system-ui, sans-serif',
                borderRadius: 12, border: 'none',
                backgroundColor: isLoading ? 'rgba(128,5,50,0.6)' : '#800532',
                color: 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                letterSpacing: '-0.3px',
                transition: 'opacity 0.2s',
                marginTop: 2,
              }}
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'rgba(35,6,3,0.5)' }}>
            Already have an account?{' '}
            <Link href="/signin" style={{ color: '#800532', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
