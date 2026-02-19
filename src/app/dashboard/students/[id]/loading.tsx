import { ShimmerBar } from '@/components/shared/Shimmer';

export default function StudentDetailLoading() {
    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            {/* Back + header */}
            <div style={{ marginBottom: 24 }}>
                <ShimmerBar width={80} height={13} style={{ marginBottom: 16 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="rin-shimmer" style={{ width: 52, height: 52, borderRadius: '50%' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <ShimmerBar width={200} height={22} radius={8} />
                        <ShimmerBar width={140} height={13} />
                    </div>
                    <ShimmerBar width={110} height={36} radius={10} />
                </div>
            </div>

            {/* Risk score card */}
            <div style={{ backgroundColor: 'white', borderRadius: 14, border: '0.67px solid rgb(228,221,205)', padding: '24px', marginBottom: 16, display: 'flex', gap: 24, alignItems: 'center' }}>
                <div className="rin-shimmer" style={{ width: 80, height: 80, borderRadius: '50%' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    <ShimmerBar width="30%" height={13} />
                    <ShimmerBar width="20%" height={28} radius={8} />
                    <ShimmerBar width="50%" height={11} />
                </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ backgroundColor: 'white', borderRadius: 14, border: '0.67px solid rgb(228,221,205)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <ShimmerBar width="50%" height={11} />
                        <ShimmerBar width="35%" height={22} radius={6} />
                    </div>
                ))}
            </div>

            {/* Notes + factors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ backgroundColor: 'white', borderRadius: 14, border: '0.67px solid rgb(228,221,205)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <ShimmerBar width="40%" height={13} style={{ marginBottom: 4 }} />
                    {Array.from({ length: 4 }).map((_, i) => <ShimmerBar key={i} width={i === 3 ? '65%' : '100%'} height={11} />)}
                </div>
                <div style={{ backgroundColor: 'white', borderRadius: 14, border: '0.67px solid rgb(228,221,205)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <ShimmerBar width="40%" height={13} style={{ marginBottom: 4 }} />
                    {Array.from({ length: 4 }).map((_, i) => <ShimmerBar key={i} width={i === 3 ? '55%' : '90%'} height={11} />)}
                </div>
            </div>

            <style>{`
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        .rin-shimmer { background:linear-gradient(90deg,rgb(240,237,230) 25%,rgb(249,247,242) 50%,rgb(240,237,230) 75%); background-size:600px 100%; animation:shimmer 1.4s infinite linear; border-radius:6px; }
      `}</style>
        </div>
    );
}
