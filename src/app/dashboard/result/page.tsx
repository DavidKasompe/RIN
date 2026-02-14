'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Badge } from '@/components/shared';

interface AnalysisData {
  attendance: number;
  academicScore: number;
  participation: string;
  trend: string;
  assignmentCompletion: number;
  behaviorIncidents: string;
}

export default function DecisionResultPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [riskStatus, setRiskStatus] = useState<'at-risk' | 'not-at-risk'>('not-at-risk');
  const [confidence, setConfidence] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('studentAnalysis');
    if (stored) {
      const data = JSON.parse(stored) as AnalysisData;
      setAnalysisData(data);
      
      // Simulate risk calculation based on inputs
      const riskScore = calculateRiskScore(data);
      setRiskStatus(riskScore > 50 ? 'at-risk' : 'not-at-risk');
      setConfidence(Math.min(95, Math.max(65, 100 - Math.abs(riskScore - 50) * 0.5)));
    }
    
    // Animate the confidence counter
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const calculateRiskScore = (data: AnalysisData): number => {
    let score = 0;
    
    // Lower attendance increases risk
    if (data.attendance < 70) score += 25;
    else if (data.attendance < 85) score += 10;
    
    // Lower academic score increases risk
    if (data.academicScore < 60) score += 25;
    else if (data.academicScore < 75) score += 10;
    
    // Lower assignment completion increases risk
    if (data.assignmentCompletion < 60) score += 20;
    else if (data.assignmentCompletion < 80) score += 10;
    
    // Participation level
    if (data.participation === 'none') score += 15;
    else if (data.participation === 'low') score += 10;
    
    // Declining trend
    if (data.trend === 'declining') score += 15;
    
    // Behavior incidents
    if (data.behaviorIncidents === 'frequent') score += 20;
    else if (data.behaviorIncidents === 'moderate') score += 10;
    else if (data.behaviorIncidents === 'minor') score += 5;
    
    return Math.min(100, score);
  };

  const getSummary = () => {
    if (riskStatus === 'at-risk') {
      return "Based on the provided metrics, this student shows signs that may indicate potential academic challenges. Early intervention is recommended.";
    }
    return "Based on the provided metrics, this student appears to be performing well with no immediate concerns flagged by our analysis.";
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
          Analysis Result
        </h1>
        <p className="text-[var(--color-text-light)]">
          Here&apos;s the AI-generated risk assessment for this student.
        </p>
      </div>

      {/* Risk Status Card */}
      <Card 
        variant="gradient" 
        padding="lg" 
        className={`mb-6 border-2 ${
          riskStatus === 'at-risk' 
            ? 'border-red-200' 
            : 'border-green-200'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <Badge status={riskStatus} size="lg" className="mb-4" />
            <p className="text-[var(--color-text-light)] max-w-md">
              {getSummary()}
            </p>
          </div>
          
          {/* Confidence Meter */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="var(--color-card)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={riskStatus === 'at-risk' ? '#ef4444' : '#4ade80'}
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${isLoaded ? (confidence / 100) * 352 : 0} 352`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-[var(--color-text)]">
                  {isLoaded ? Math.round(confidence) : 0}%
                </span>
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-light)] mt-2">Confidence Score</p>
          </div>
        </div>
      </Card>

      {/* Key Metrics Summary */}
      {analysisData && (
        <Card variant="gradient" padding="lg" className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            Input Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Attendance', value: `${analysisData.attendance}%`, icon: '📅' },
              { label: 'Academic Score', value: `${analysisData.academicScore}%`, icon: '📊' },
              { label: 'Assignments', value: `${analysisData.assignmentCompletion}%`, icon: '📝' },
              { label: 'Participation', value: analysisData.participation, icon: '🙋' },
              { label: 'Trend', value: analysisData.trend, icon: '📈' },
              { label: 'Behavior', value: analysisData.behaviorIncidents, icon: '🎯' },
            ].map((metric, index) => (
              <div 
                key={index}
                className="p-4 rounded-xl bg-white/50 text-center"
              >
                <span className="text-2xl">{metric.icon}</span>
                <p className="text-xs text-[var(--color-text-light)] mt-1">{metric.label}</p>
                <p className="font-semibold text-[var(--color-text)] capitalize">{metric.value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button href="/dashboard/input" variant="outline" className="flex-1">
          ← Analyze Another
        </Button>
        <Button href="/dashboard/overview" className="flex-[2]">
          View Full Explanation →
        </Button>
      </div>
    </div>
  );
}
