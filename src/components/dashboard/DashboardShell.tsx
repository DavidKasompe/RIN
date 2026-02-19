'use client';

import { usePathname } from 'next/navigation';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isChat = pathname === '/dashboard';

    return (
        <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {isChat ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    {children}
                </div>
            ) : (
                <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                    {children}
                </div>
            )}
        </main>
    );
}
