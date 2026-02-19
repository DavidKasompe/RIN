'use client';

type RiskCategory = 'Critical' | 'At Risk' | 'Moderate' | 'Low' | string;

const RISK_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
    Critical: { bg: 'rgba(124,13,13,0.1)', color: '#7C0D0D', dot: '#7C0D0D' },
    'At Risk': { bg: 'rgba(192,57,43,0.1)', color: '#C0392B', dot: '#C0392B' },
    Moderate: { bg: 'rgba(230,126,22,0.1)', color: '#C87A0A', dot: '#E67E22' },
    Low: { bg: 'rgba(39,174,96,0.1)', color: '#1D7A47', dot: '#27AE60' },
};

export default function RiskBadge({ category, score }: { category: RiskCategory; score?: number }) {
    const style = RISK_STYLES[category] ?? RISK_STYLES.Low;
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 9px',
            borderRadius: 9999,
            backgroundColor: style.bg,
            fontSize: 12,
            fontWeight: 600,
            color: style.color,
            letterSpacing: '-0.1px',
            whiteSpace: 'nowrap',
            fontFamily: 'Inter, system-ui, sans-serif',
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: style.dot, display: 'inline-block', flexShrink: 0 }} />
            {category}
            {score !== undefined && (
                <span style={{ fontWeight: 700, marginLeft: 2 }}>{Math.round(score)}</span>
            )}
        </span>
    );
}
