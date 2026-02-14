'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  RadarChart,
} from '@/components/shared';
import {
  getAnalyses,
  computeStats,
  aggregateFactors,
  aggregateRadarData,
  timeAgo,
  type StoredAnalysis,
} from '@/lib/analysisStore';

export default function OverviewPage() {
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAnalyses(getAnalyses());
    setMounted(true);
  }, []);

  const stats = computeStats(analyses);
  const factors = aggregateFactors(analyses);
  const radarData = aggregateRadarData(analyses);
  const recentAnalyses = analyses.slice(0, 5);

  const statCards = [
    { label: 'Total Analyzed', value: stats.total.toString(), icon: '/image-icon/vecteezy_icon-business-3d-statistics-for-web-app-infographic_8525600.png', trend: `+${stats.thisWeekTotal} this week` },
    { label: 'At Risk', value: stats.atRisk.toString(), icon: '/image-icon/vecteezy_3d-yellow-lightning-bolt-icon-with-glossy-finish-isolated_72951498.png', trend: `${stats.thisWeekAtRisk} flagged this week` },
    { label: 'Avg Confidence', value: stats.avgConfidence > 0 ? `${stats.avgConfidence}%` : '—', icon: '/image-icon/vecteezy_business-goal-3d-icon-illustration-or-business-target-3d_32851403.png', trend: stats.total > 0 ? 'Across all analyses' : 'No data yet' },
    { label: 'Analyses Today', value: analyses.filter(a => a.timestamp > Date.now() - 86400000).length.toString(), icon: '/image-icon/vecteezy_3d-clipboard-icon-for-business-isolated-on-clean-background_47308238.png', trend: 'Last 24 hours' },
  ];

  // Extract student name from the query (first few words or fallback)
  const extractName = (analysis: StoredAnalysis) => {
    const q = analysis.query;
    // Try to find a name pattern like "Analyze Sarah Johnson"
    const nameMatch = q.match(/(?:analyze|assess|evaluate|review)\s+(\w+(?:\s+\w+)?)/i);
    if (nameMatch) return nameMatch[1];
    // Fallback: use first 20 chars of query
    return q.length > 25 ? q.slice(0, 22) + '...' : q;
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Critical Risk': return { bg: 'bg-red-200 text-red-900', label: '🔴 Critical' };
      case 'At Risk': return { bg: 'bg-red-100 text-red-700', label: '⚠️ At Risk' };
      case 'Moderate Risk': return { bg: 'bg-amber-100 text-amber-700', label: '🟡 Moderate' };
      default: return { bg: 'bg-green-100 text-green-700', label: '✅ Low' };
    }
  };

  if (!mounted) {
    return (
      <div className="animate-fade-in flex items-center justify-center min-h-[400px]">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-1 flex items-center gap-2">
          Overview <img src="/image-icon/vecteezy_icon-business-3d-statistics-for-web-app-infographic_8525600.png" alt="" style={{ width: '36px', height: '36px', objectFit: 'contain', display: 'inline-block' }} />
        </h1>
        <p className="text-sm sm:text-base text-[var(--color-text-light)]">
          {analyses.length > 0
            ? `Showing insights from ${analyses.length} student ${analyses.length === 1 ? 'analysis' : 'analyses'}.`
            : 'No analyses yet — go to the chat to analyze your first student.'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {statCards.map((stat, i) => (
          <Card key={i} variant="gradient" hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[var(--color-text-light)] mb-1">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-[var(--color-primary)] mt-1">{stat.trend}</p>
              </div>
              <img src={stat.icon} alt={stat.label} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </div>
          </Card>
        ))}
      </div>

      {/* Radar + Factors */}
      {analyses.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Radar Chart */}
            <Card className="p-4 sm:p-6">
              <h2 className="text-sm sm:text-base font-semibold text-[var(--color-text)] mb-3 sm:mb-4">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><img src="/image-icon/vecteezy_minimalist-magnifying-glass-icon-with-blue-handle-3d-render_58144752.png" alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} /> Multi-Dimensional View</span>
              </h2>
              <div className="flex justify-center">
                <RadarChart
                  data={radarData}
                  color="var(--color-chart-blue)"
                />
              </div>
              <p className="text-[10px] text-center text-[var(--color-text-light)] mt-3">
                Aggregated across {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'}
              </p>
            </Card>

            {/* Contributing Factors */}
            <Card className="p-4 sm:p-6">
              <h2 className="text-sm sm:text-base font-semibold text-[var(--color-text)] mb-3 sm:mb-4">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><img src="/image-icon/vecteezy_leadership-for-successful-new-idea-excellent-business-graph_8879458.png" alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} /> Top Contributing Factors</span>
              </h2>
              {factors.length > 0 ? (
                <div className="space-y-3">
                  {factors.map((factor, i) => (
                    <div key={i} className="group">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs sm:text-sm font-medium text-[var(--color-text)]">
                          {factor.name}
                        </span>
                        <span className={`text-xs font-medium ${
                          factor.direction === 'negative' ? 'text-red-500' :
                          factor.direction === 'positive' ? 'text-green-500' : 'text-gray-500'
                        }`}>
                          {factor.direction === 'negative' ? '−' : factor.direction === 'positive' ? '+' : '○'} {factor.impact}%
                        </span>
                      </div>
                      <div className="w-full h-6 bg-gray-100 rounded-lg overflow-hidden relative">
                        <div
                          className={`h-full rounded-lg transition-all duration-500 ${
                            factor.direction === 'negative' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                            factor.direction === 'positive' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                            'bg-gradient-to-r from-gray-300 to-gray-400'
                          }`}
                          style={{ width: `${factor.impact}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-2">
                          <span className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            {factor.description}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-light)] text-center py-8">
                  Factors will appear after your first analysis.
                </p>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Empty state for charts */}
      {analyses.length === 0 && (
        <Card className="mb-6 sm:mb-8 p-8 sm:p-12 text-center">
          <div className="mb-4"><img src="/image-icon/vecteezy_minimalist-magnifying-glass-icon-with-blue-handle-3d-render_58144752.png" alt="" style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto' }} /></div>
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">No analyses yet</h3>
          <p className="text-sm text-[var(--color-text-light)] mb-6 max-w-md mx-auto">
            Start analyzing students in the chat to see risk breakdowns, contributing factors, and multi-dimensional insights here.
          </p>
          <Link href="/dashboard">
            <button className="px-6 py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity active:scale-95">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><img src="/image-icon/vecteezy_dramatic-classic-a-brain-human-medically-accurate-high_59623516.png" alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} /> Start Analyzing</span>
            </button>
          </Link>
        </Card>
      )}

      {/* Recent Analyses */}
      <Card variant="gradient" className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm sm:text-lg font-semibold text-[var(--color-text)]">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><img src="/image-icon/vecteezy_3d-clipboard-icon-for-business-isolated-on-clean-background_47308238.png" alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} /> Recent Analyses</span>
          </h2>
          {analyses.length > 5 && (
            <span className="text-xs sm:text-sm text-[var(--color-text-light)]">
              Showing latest 5 of {analyses.length}
            </span>
          )}
        </div>

        {recentAnalyses.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {recentAnalyses.map((analysis) => {
              const badge = getCategoryBadge(analysis.category);
              return (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/50 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0 ${
                      analysis.riskScore >= 70 ? 'bg-gradient-to-br from-red-500 to-red-600' :
                      analysis.riskScore >= 40 ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                      'bg-gradient-to-br from-green-500 to-green-600'
                    }`}>
                      {analysis.riskScore}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-medium text-[var(--color-text)] truncate">
                        {extractName(analysis)}
                      </p>
                      <p className="text-xs sm:text-sm text-[var(--color-text-light)]">
                        {timeAgo(analysis.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-medium text-[var(--color-text)]">
                        {analysis.confidence}%
                      </p>
                      <span className={`inline-block px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                    <Link
                      href="/dashboard"
                      className="p-1.5 sm:p-2 rounded-lg hover:bg-[var(--color-card)] transition-colors"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-text-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-light)] text-center py-6">
            Your analyzed students will appear here.
          </p>
        )}
      </Card>

      {/* Risk Distribution Summary */}
      {analyses.length >= 3 && (
        <Card className="mb-6 sm:mb-8 p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-semibold text-[var(--color-text)] mb-4">
            📈 Risk Distribution
          </h2>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {[
              { label: 'Low', color: 'bg-green-500', count: analyses.filter(a => a.category === 'Low Risk').length },
              { label: 'Moderate', color: 'bg-amber-500', count: analyses.filter(a => a.category === 'Moderate Risk').length },
              { label: 'At Risk', color: 'bg-red-500', count: analyses.filter(a => a.category === 'At Risk').length },
              { label: 'Critical', color: 'bg-red-800', count: analyses.filter(a => a.category === 'Critical Risk').length },
            ].map((bucket) => (
              <div key={bucket.label} className="text-center">
                <div className="relative w-full h-24 sm:h-32 bg-gray-100 rounded-lg overflow-hidden flex items-end">
                  <div
                    className={`w-full ${bucket.color} rounded-t-md transition-all duration-700`}
                    style={{
                      height: analyses.length > 0 ? `${Math.max(8, (bucket.count / analyses.length) * 100)}%` : '8%',
                    }}
                  />
                </div>
                <p className="text-xs sm:text-sm font-medium text-[var(--color-text)] mt-2">{bucket.count}</p>
                <p className="text-[10px] sm:text-xs text-[var(--color-text-light)]">{bucket.label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Ethical Disclaimer */}
      <Card variant="glass">
        <div className="flex items-start gap-3 sm:gap-4">
          <span className="text-xl sm:text-2xl">ℹ️</span>
          <div>
            <h3 className="font-semibold text-[var(--color-text)] mb-1 text-sm sm:text-base">
              Responsible AI Commitment
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-light)]">
              RIN&apos;s predictions are designed to support — not replace — educator judgment.
              All recommendations should be considered alongside your professional expertise
              and knowledge of individual students.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
