'use client';

import { usePathname } from 'next/navigation';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isChat = pathname === '/dashboard';

    return (
        <main className="flex-1 overflow-y-auto min-w-0 flex flex-col relative w-full">
            {isChat ? (
                <div className="flex-1 flex flex-col min-h-0">
                    {children}
                </div>
            ) : (
                <div className="px-5 py-6 pt-16 md:py-8 md:px-10 max-w-[1200px] mx-auto w-full box-border">
                    {children}
                </div>
            )}
        </main>
    );
}
