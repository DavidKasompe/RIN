import { ShimmerBar, ShimmerCard } from '@/components/shared/Shimmer';

export default function CalendarLoading() {
    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            {/* Header */}
            <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <ShimmerBar width={150} height={26} radius={8} />
                    <ShimmerBar width={260} height={13} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <ShimmerBar width={36} height={36} radius={9} />
                    <ShimmerBar width={120} height={36} radius={9} />
                    <ShimmerBar width={36} height={36} radius={9} />
                </div>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
                {Array.from({ length: 7 }).map((_, i) => (
                    <ShimmerBar key={i} width="60%" height={12} style={{ margin: '0 auto' }} />
                ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} style={{
                        backgroundColor: 'white',
                        border: '0.67px solid rgb(228,221,205)',
                        borderRadius: 10,
                        padding: '10px 8px',
                        minHeight: 80,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                    }}>
                        <ShimmerBar width={22} height={11} />
                        {i % 4 === 0 && <ShimmerBar width="85%" height={10} />}
                        {i % 5 === 1 && <ShimmerBar width="70%" height={10} />}
                    </div>
                ))}
            </div>

            <style>{`
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        .rin-shimmer { background:linear-gradient(90deg,rgb(240,237,230) 25%,rgb(249,247,242) 50%,rgb(240,237,230) 75%); background-size:600px 100%; animation:shimmer 1.4s infinite linear; border-radius:6px; }
      `}</style>
        </div>
    );
}
