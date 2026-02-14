'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Slider, Select } from '@/components/shared';

export default function StudentInputPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    attendance: 75,
    academicScore: 70,
    participation: 'medium',
    trend: 'stable',
    assignmentCompletion: 80,
    behaviorIncidents: 'none',
  });

  const participationOptions = [
    { value: 'high', label: '🌟 High - Actively engaged in class' },
    { value: 'medium', label: '📚 Medium - Regular participation' },
    { value: 'low', label: '📉 Low - Minimal participation' },
    { value: 'none', label: '❌ None - No participation observed' },
  ];

  const trendOptions = [
    { value: 'improving', label: '📈 Improving - Upward trend' },
    { value: 'stable', label: '➡️ Stable - Consistent performance' },
    { value: 'declining', label: '📉 Declining - Downward trend' },
  ];

  const behaviorOptions = [
    { value: 'none', label: '✅ None - No incidents' },
    { value: 'minor', label: '⚠️ Minor - 1-2 small incidents' },
    { value: 'moderate', label: '🔶 Moderate - 3-5 incidents' },
    { value: 'frequent', label: '🔴 Frequent - Regular incidents' },
  ];

  const handleSliderChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [name]: parseInt(e.target.value) }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    // Store data in sessionStorage to pass to result page
    sessionStorage.setItem('studentAnalysis', JSON.stringify(formData));
    router.push('/dashboard/result');
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
          Analyze Student
        </h1>
        <p className="text-[var(--color-text-light)]">
          Enter student metrics to generate a risk assessment and personalized recommendations.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card variant="gradient" padding="lg" className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-sm">1</span>
            Academic Metrics
          </h2>
          
          <div className="space-y-8">
            <Slider
              label="Attendance Rate"
              min={0}
              max={100}
              value={formData.attendance}
              onChange={handleSliderChange('attendance')}
              unit="%"
            />

            <Slider
              label="Academic Score (GPA / Average)"
              min={0}
              max={100}
              value={formData.academicScore}
              onChange={handleSliderChange('academicScore')}
              unit="%"
            />

            <Slider
              label="Assignment Completion Rate"
              min={0}
              max={100}
              value={formData.assignmentCompletion}
              onChange={handleSliderChange('assignmentCompletion')}
              unit="%"
            />
          </div>
        </Card>

        <Card variant="gradient" padding="lg" className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-sm">2</span>
            Engagement & Behavior
          </h2>
          
          <div className="space-y-6">
            <Select
              label="Class Participation Level"
              name="participation"
              value={formData.participation}
              onChange={handleSelectChange}
              options={participationOptions}
            />

            <Select
              label="Performance Trend"
              name="trend"
              value={formData.trend}
              onChange={handleSelectChange}
              options={trendOptions}
            />

            <Select
              label="Behavior Incidents"
              name="behaviorIncidents"
              value={formData.behaviorIncidents}
              onChange={handleSelectChange}
              options={behaviorOptions}
            />
          </div>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="ghost" href="/dashboard" className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-[2]">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing with AI...
              </span>
            ) : (
              '🔍 Analyze Student'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
