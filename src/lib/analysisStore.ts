/**
 * Analysis Store — persists completed analyses to localStorage
 * so the Overview page can display real data.
 */

export interface StoredAnalysis {
  id: string;
  timestamp: number;
  query: string;            // What the user asked
  summary: string;          // AI's summary
  riskScore: number;
  category: string;         // 'Low Risk' | 'Moderate Risk' | 'At Risk' | 'Critical Risk'
  confidence: number;
  factors: {
    name: string;
    impactPercentage: number;
    trend: 'up' | 'down' | 'neutral';
    description: string;
  }[];
}

const STORAGE_KEY = 'rin_analyses';

export function getAnalyses(): StoredAnalysis[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAnalysis(analysis: Omit<StoredAnalysis, 'id' | 'timestamp'>): StoredAnalysis {
  const entry: StoredAnalysis = {
    ...analysis,
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    timestamp: Date.now(),
  };

  const existing = getAnalyses();
  // Keep last 50 analyses max
  const updated = [entry, ...existing].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return entry;
}

export function clearAnalyses(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Computed Stats ────────────────────────────────────────────────

export function computeStats(analyses: StoredAnalysis[]) {
  const total = analyses.length;
  const atRisk = analyses.filter(a => a.category === 'At Risk' || a.category === 'Critical Risk').length;
  const avgConfidence = total > 0
    ? Math.round(analyses.reduce((sum, a) => sum + a.confidence, 0) / total)
    : 0;

  // Week filter (last 7 days)
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = analyses.filter(a => a.timestamp > oneWeekAgo);
  const thisWeekTotal = thisWeek.length;
  const thisWeekAtRisk = thisWeek.filter(a => a.category === 'At Risk' || a.category === 'Critical Risk').length;

  return {
    total,
    atRisk,
    avgConfidence,
    thisWeekTotal,
    thisWeekAtRisk,
  };
}

// ── Aggregate Factors ─────────────────────────────────────────────

export function aggregateFactors(analyses: StoredAnalysis[]) {
  if (analyses.length === 0) return [];

  // Collect all factors across analyses
  const factorMap = new Map<string, { totalImpact: number; count: number; trends: string[]; descriptions: string[] }>();

  for (const analysis of analyses) {
    for (const factor of analysis.factors) {
      const existing = factorMap.get(factor.name) || { totalImpact: 0, count: 0, trends: [], descriptions: [] };
      existing.totalImpact += factor.impactPercentage;
      existing.count += 1;
      existing.trends.push(factor.trend);
      existing.descriptions.push(factor.description);
      factorMap.set(factor.name, existing);
    }
  }

  // Convert to sorted array
  return Array.from(factorMap.entries())
    .map(([name, data]) => ({
      name,
      impact: Math.round(data.totalImpact / data.count),
      direction: getMajorityTrend(data.trends),
      description: data.descriptions[data.descriptions.length - 1], // latest
    }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 6);
}

function getMajorityTrend(trends: string[]): 'positive' | 'negative' | 'neutral' {
  const counts = { up: 0, down: 0, neutral: 0 };
  for (const t of trends) {
    if (t === 'up') counts.up++;
    else if (t === 'down') counts.down++;
    else counts.neutral++;
  }
  if (counts.down > counts.up && counts.down > counts.neutral) return 'negative';
  if (counts.up > counts.down && counts.up > counts.neutral) return 'positive';
  return 'neutral';
}

// ── Aggregate Radar Data ──────────────────────────────────────────

export function aggregateRadarData(analyses: StoredAnalysis[]) {
  if (analyses.length === 0) {
    return [
      { dimension: 'Attendance', value: 0, maxValue: 100 },
      { dimension: 'Academic', value: 0, maxValue: 100 },
      { dimension: 'Completion', value: 0, maxValue: 100 },
      { dimension: 'Participation', value: 0, maxValue: 100 },
      { dimension: 'Behavior', value: 0, maxValue: 100 },
    ];
  }

  // Map factor names to radar dimensions
  const dimensionMap: Record<string, string> = {
    'attendance': 'Attendance',
    'academic': 'Academic',
    'assignment': 'Completion',
    'completion': 'Completion',
    'participation': 'Participation',
    'engagement': 'Participation',
    'behavior': 'Behavior',
    'performance': 'Academic',
    'trend': 'Behavior',
  };

  const dimensions: Record<string, { total: number; count: number }> = {
    'Attendance': { total: 0, count: 0 },
    'Academic': { total: 0, count: 0 },
    'Completion': { total: 0, count: 0 },
    'Participation': { total: 0, count: 0 },
    'Behavior': { total: 0, count: 0 },
  };

  for (const analysis of analyses) {
    for (const factor of analysis.factors) {
      const lowerName = factor.name.toLowerCase();
      for (const [keyword, dimension] of Object.entries(dimensionMap)) {
        if (lowerName.includes(keyword)) {
          // Convert impact to a score (higher impact = lower score in that area)
          const score = Math.max(10, 100 - factor.impactPercentage * 1.5);
          dimensions[dimension].total += score;
          dimensions[dimension].count += 1;
          break;
        }
      }
    }
  }

  return Object.entries(dimensions).map(([dimension, data]) => ({
    dimension,
    value: data.count > 0 ? Math.round(data.total / data.count) : 50,
    maxValue: 100,
  }));
}

// ── Time Formatting ───────────────────────────────────────────────

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}
