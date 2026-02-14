'use client';

import { useState } from 'react';
import { Navbar } from '@/components/shared';
import DashboardSidebar from '@/components/shared/DashboardSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      <DashboardSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Sidebar toggle button — visible when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          style={{
            position: 'fixed',
            top: '24px',
            left: '16px',
            zIndex: 55,
            background: '#fff',
            border: '1px solid #e8e8e5',
            borderRadius: '10px',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            color: '#72726e',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      )}

      <main
        style={{
          paddingTop: '144px',
          paddingBottom: '48px',
          paddingLeft: '12px',
          paddingRight: '12px',
          marginLeft: sidebarOpen ? '280px' : '0',
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
