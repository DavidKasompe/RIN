'use client';

import { TrendUp, TrendDown, Minus } from 'iconsax-reactjs';

interface StatCardProps {
    label: string;
    value: string | number;
    sub?: string;
    trend?: 'up' | 'down' | 'flat';
    trendLabel?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    IconComponent?: React.ElementType<any>;
    accentColor?: string;
}

export default function StatCard({
    label,
    value,
    sub,
    trend,
    trendLabel,
    IconComponent,
    accentColor = '#800532',
}: StatCardProps) {
    const trendColor = trend === 'up' ? '#27AE60' : trend === 'down' ? '#C0392B' : 'rgba(35,6,3,0.35)';
    const TrendIcon = trend === 'up' ? TrendUp : trend === 'down' ? TrendDown : Minus;

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: '24px 24px',
            border: '1px solid rgba(35,6,3,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            fontFamily: 'Inter, system-ui, sans-serif',
        }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(35,6,3,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {label}
                </span>
                {IconComponent && (
                    <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${accentColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconComponent size={18} color={accentColor} variant="Bulk" />
                    </div>
                )}
            </div>
            {/* Value */}
            <div>
                <span style={{ fontSize: 32, fontWeight: 700, color: '#230603', letterSpacing: '-1.5px', lineHeight: 1 }}>
                    {value}
                </span>
                {sub && (
                    <span style={{ fontSize: 13, color: 'rgba(35,6,3,0.4)', marginLeft: 6 }}>{sub}</span>
                )}
            </div>
            {/* Trend */}
            {trend && trendLabel && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <TrendIcon size={14} color={trendColor} />
                    <span style={{ fontSize: 12, color: trendColor, fontWeight: 500 }}>{trendLabel}</span>
                </div>
            )}
        </div>
    );
}
