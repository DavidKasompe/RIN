'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/components/shared';

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-2xl text-[var(--color-primary)]">RIN</span>
            <span className="text-xs text-[var(--color-text-light)] -mt-1">Responsible Insight Navigator</span>
          </div>
        </Link>

        <Card variant="gradient" padding="lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
              Welcome Back
            </h1>
            <p className="text-[var(--color-text-light)]">
              Sign in to continue to your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-[var(--color-muted)] text-[var(--color-cta)] focus:ring-[var(--color-cta)]"
                />
                <span className="text-sm text-[var(--color-text-light)]">Remember me</span>
              </label>
              <a href="#" className="text-sm text-[var(--color-cta)] hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-[var(--color-text-light)]">Don&apos;t have an account? </span>
            <Link href="/signup" className="text-[var(--color-cta)] font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
