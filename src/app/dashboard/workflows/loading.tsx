import { ShimmerBar, ShimmerCard } from '@/components/shared/Shimmer';

export default function WorkflowsLoading() {
    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            {/* Header */}
            <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <ShimmerBar width={170} height={26} radius={8} />
                    <ShimmerBar width={280} height={13} />
                </div>
                <ShimmerBar width={150} height={38} radius={10} />
            </div>

            {/* Workflow cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{
                        backgroundColor: 'white',
                        borderRadius: 14,
                        border: '0.67px solid rgb(228,221,205)',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                    }}>
                        <div className="rin-shimmer" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <ShimmerBar width="35%" height={14} />
                            <ShimmerBar width="60%" height={11} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <ShimmerBar width={70} height={30} radius={8} />
                            <ShimmerBar width={36} height={30} radius={8} />
                        </div>
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
