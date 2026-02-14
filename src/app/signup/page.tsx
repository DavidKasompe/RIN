'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Select } from '@/components/shared';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'educator',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
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
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

  const roleOptions = [
    { value: 'educator', label: '👩‍🏫 Educator / Teacher' },
    { value: 'administrator', label: '🏫 School Administrator' },
    { value: 'advisor', label: '📋 Academic Advisor' },
  ];

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
              Create Your Account
            </h1>
            <p className="text-[var(--color-text-light)]">
              Start understanding AI decisions today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Select
              label="Your Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={roleOptions}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              helperText="At least 6 characters"
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />

            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                required
                className="w-4 h-4 mt-0.5 rounded border-[var(--color-muted)] text-[var(--color-cta)] focus:ring-[var(--color-cta)]"
              />
              <span className="text-sm text-[var(--color-text-light)]">
                I agree to the{' '}
                <a href="#" className="text-[var(--color-cta)] hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-[var(--color-cta)] hover:underline">Privacy Policy</a>
              </span>
            </div>

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-[var(--color-text-light)]">Already have an account? </span>
            <Link href="/signin" className="text-[var(--color-cta)] font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
