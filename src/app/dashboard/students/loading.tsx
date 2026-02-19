import { ShimmerBar, ShimmerTableRow } from '@/components/shared/Shimmer';

export default function StudentsLoading() {
    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <ShimmerBar width={160} height={26} radius={8} />
                    <ShimmerBar width={240} height={13} />
                </div>
                <ShimmerBar width={140} height={38} radius={10} />
            </div>

            {/* Search + filter bar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <ShimmerBar width="100%" height={42} radius={10} />
                <ShimmerBar width={120} height={42} radius={10} />
            </div>

            {/* Table */}
            <div style={{ backgroundColor: 'white', borderRadius: 14, border: '0.67px solid rgb(228,221,205)', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, padding: '14px 24px', borderBottom: '0.67px solid rgb(228,221,205)' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <ShimmerBar key={i} width="60%" height={11} />
                    ))}
                </div>
                {/* Rows */}
                <div style={{ padding: '0 24px' }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <ShimmerTableRow key={i} cols={5} />
                    ))}
                </div>
            </div>

            <style>{`
        @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
        .rin-shimmer { background: linear-gradient(90deg,rgb(240,237,230) 25%,rgb(249,247,242) 50%,rgb(240,237,230) 75%); background-size:600px 100%; animation:shimmer 1.4s infinite linear; border-radius:6px; }
      `}</style>
        </div>
    );
}
