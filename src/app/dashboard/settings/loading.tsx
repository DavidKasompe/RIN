import { ShimmerBar, ShimmerCard } from '@/components/shared/Shimmer';

export default function SettingsLoading() {
    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", maxWidth: 680 }}>
            {/* Header */}
            <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <ShimmerBar width={120} height={26} radius={8} />
                <ShimmerBar width={280} height={13} />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
                <ShimmerCard key={i} lines={3} hasTitle style={{ marginBottom: 16 }} />
            ))}

            <style>{`
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        .rin-shimmer { background:linear-gradient(90deg,rgb(240,237,230) 25%,rgb(249,247,242) 50%,rgb(240,237,230) 75%); background-size:600px 100%; animation:shimmer 1.4s infinite linear; border-radius:6px; }
      `}</style>
        </div>
    );
}
