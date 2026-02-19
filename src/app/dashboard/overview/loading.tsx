import { ShimmerStatCard, ShimmerBar, ShimmerTableRow } from '@/components/shared/Shimmer';

export default function OverviewLoading() {
    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            {/* Page header */}
            <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <ShimmerBar width={200} height={28} radius={8} />
                <ShimmerBar width={300} height={14} radius={6} />
            </div>

            {/* Stat cards row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {Array.from({ length: 4 }).map((_, i) => <ShimmerStatCard key={i} />)}
            </div>

            {/* Two column section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[0, 1].map(i => (
                    <div key={i} style={{ backgroundColor: 'white', borderRadius: 14, border: '0.67px solid rgb(228,221,205)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <ShimmerBar width="40%" height={14} />
                        {Array.from({ length: 5 }).map((_, j) => (
                            <ShimmerBar key={j} width={j === 4 ? '65%' : '100%'} height={12} />
                        ))}
                    </div>
                ))}
            </div>

            {/* Table section */}
            <div style={{ backgroundColor: 'white', borderRadius: 14, border: '0.67px solid rgb(228,221,205)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '0.67px solid rgb(228,221,205)' }}>
                    <ShimmerBar width={160} height={14} />
                </div>
                <div style={{ padding: '0 24px', paddingBottom: 8 }}>
                    {Array.from({ length: 6 }).map((_, i) => <ShimmerTableRow key={i} cols={5} />)}
                </div>
            </div>

            <style>{`
        @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
        .rin-shimmer { background: linear-gradient(90deg, rgb(240,237,230) 25%, rgb(249,247,242) 50%, rgb(240,237,230) 75%); background-size: 600px 100%; animation: shimmer 1.4s infinite linear; border-radius: 6px; }
      `}</style>
        </div>
    );
}
