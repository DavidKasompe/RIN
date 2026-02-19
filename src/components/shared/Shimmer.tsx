import React from 'react';

/* Shimmer keyframe is injected once globally via a style tag. */
const SHIMMER_CSS = `
@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}
.rin-shimmer {
  background: linear-gradient(90deg, rgb(240,237,230) 25%, rgb(249,247,242) 50%, rgb(240,237,230) 75%);
  background-size: 600px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: 6px;
}
`;

let injected = false;
function injectStyles() {
    if (injected || typeof document === 'undefined') return;
    injected = true;
    const style = document.createElement('style');
    style.innerHTML = SHIMMER_CSS;
    document.head.appendChild(style);
}

/** A single shimmer bar. Renders as a rounded rectangle. */
export function ShimmerBar({ width = '100%', height = 16, radius = 6, style }: {
    width?: string | number;
    height?: number;
    radius?: number;
    style?: React.CSSProperties;
}) {
    if (typeof window !== 'undefined') injectStyles();
    return (
        <div
            className="rin-shimmer"
            style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }}
        />
    );
}

/** A shimmer circle (for avatars / stat icons). */
export function ShimmerCircle({ size = 40 }: { size?: number }) {
    if (typeof window !== 'undefined') injectStyles();
    return (
        <div
            className="rin-shimmer"
            style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }}
        />
    );
}

/** A shimmer card — pre-built white card with multiple bar rows. */
export function ShimmerCard({
    lines = 3,
    hasTitle = true,
    hasIcon = false,
    style,
}: {
    lines?: number;
    hasTitle?: boolean;
    hasIcon?: boolean;
    style?: React.CSSProperties;
}) {
    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: 14,
            border: '0.67px solid rgb(228,221,205)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            ...style,
        }}>
            {hasIcon && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ShimmerCircle size={36} />
                    <ShimmerBar width="45%" height={14} />
                </div>
            )}
            {hasTitle && !hasIcon && <ShimmerBar width="40%" height={14} />}
            {Array.from({ length: lines }).map((_, i) => (
                <ShimmerBar
                    key={i}
                    width={i === lines - 1 ? '65%' : '100%'}
                    height={12}
                />
            ))}
        </div>
    );
}

/** A shimmer stat card (value + label). */
export function ShimmerStatCard({ style }: { style?: React.CSSProperties }) {
    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: 14,
            border: '0.67px solid rgb(228,221,205)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            ...style,
        }}>
            <ShimmerBar width="50%" height={11} />
            <ShimmerBar width="38%" height={28} radius={8} />
            <ShimmerBar width="70%" height={10} />
        </div>
    );
}

/** A full shimmer table row */
export function ShimmerTableRow({ cols = 5 }: { cols?: number }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 12,
            padding: '14px 0',
            borderBottom: '0.67px solid rgb(246,240,228)',
            alignItems: 'center',
        }}>
            {Array.from({ length: cols }).map((_, i) => (
                <ShimmerBar key={i} width={i === 0 ? '70%' : '55%'} height={12} />
            ))}
        </div>
    );
}
