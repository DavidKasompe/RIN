'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getChatSessions, type ChatSession, getActiveChatId } from '@/lib/chatStore';

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function DashboardSidebar({ isOpen, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatIdState] = useState<string | null>(null);

  useEffect(() => {
    setSessions(getChatSessions());
    setActiveChatIdState(getActiveChatId());
  }, []);

  // Refresh sessions when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setSessions(getChatSessions());
      setActiveChatIdState(getActiveChatId());
    }
  }, [isOpen]);

  const isActive = (path: string) => pathname === path;

  // Group sessions: Today, Yesterday, This Week, Older
  const grouped = groupSessions(sessions);

  const handleNewAnalysis = () => {
    // Dispatch custom event that dashboard page listens for
    window.dispatchEvent(new CustomEvent('rin-new-chat'));
    // Navigate to dashboard if not already there
    if (pathname !== '/dashboard') {
      router.push('/dashboard');
    }
    // Refresh sidebar
    setTimeout(() => {
      setSessions(getChatSessions());
      setActiveChatIdState(getActiveChatId());
    }, 100);
  };

  const handleLoadChat = (sessionId: string) => {
    window.dispatchEvent(new CustomEvent('rin-load-chat', { detail: sessionId }));
    if (pathname !== '/dashboard') {
      router.push('/dashboard');
    }
    setActiveChatIdState(sessionId);
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          background: '#ffffff',
          borderRight: '1px solid #e8e8e5',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 16px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0ee',
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/RIN-Logo.png" alt="RIN" style={{ height: '36px', objectFit: 'contain' }} />
          </Link>
          <button
            onClick={onToggle}
            aria-label="Close sidebar"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#72726e',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        </div>

        {/* New Analysis Button */}
        <div style={{ padding: '12px 16px 8px' }}>
          <button
            onClick={handleNewAnalysis}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#f5f5f4',
              color: '#292929',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'background 0.15s',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            New Analysis
          </button>
        </div>

        {/* Nav Links */}
        <div style={{ padding: '4px 12px 8px' }}>
          {[
            { href: '/dashboard', label: 'Analyze', icon: '/image-icon/vecteezy_business-goal-3d-icon-illustration-or-business-target-3d_32851403.png' },
            { href: '/dashboard/overview', label: 'Overview', icon: '/image-icon/vecteezy_icon-business-3d-statistics-for-web-app-infographic_8525600.png' },
            { href: '/dashboard/settings', label: 'Settings', icon: '' },
          ].map((nav) => (
            <Link
              key={nav.href}
              href={nav.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 400,
                color: isActive(nav.href) ? '#292929' : '#72726e',
                background: isActive(nav.href) ? '#f5f5f4' : 'transparent',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {nav.icon ? (
                <img src={nav.icon} alt={nav.label} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '16px' }}>⚙️</span>
              )}
              {nav.label}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#f0f0ee', margin: '0 16px' }} />

        {/* Chat History */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 12px',
          }}
        >
          {sessions.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#a0a09c', padding: '4px 4px' }}>
              No conversations yet. Start a new analysis!
            </p>
          ) : (
            <>
              {grouped.map((group) => (
                <div key={group.label} style={{ marginBottom: '16px' }}>
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#a0a09c',
                      margin: '0 4px 4px',
                    }}
                  >
                    {group.label}
                  </p>
                  {group.items.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleLoadChat(session.id)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: session.id === activeChatId ? '#292929' : '#555',
                        fontWeight: session.id === activeChatId ? 500 : 400,
                        lineHeight: '1.4',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        border: 'none',
                        background: session.id === activeChatId ? '#f0f0ee' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (session.id !== activeChatId) e.currentTarget.style.background = '#f5f5f4';
                      }}
                      onMouseLeave={(e) => {
                        if (session.id !== activeChatId) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {session.title}
                    </button>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Bottom — User */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #f0f0ee',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            E
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#292929', margin: 0 }}>Educator</p>
            <p style={{ fontSize: '11px', color: '#a0a09c', margin: 0 }}>Free Plan</p>
          </div>
          <Link
            href="/dashboard/settings"
            aria-label="Settings"
            style={{
              display: 'flex',
              color: '#a0a09c',
              padding: '4px',
              borderRadius: '6px',
              transition: 'color 0.15s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </Link>
        </div>
      </aside>

      {/* Overlay when sidebar is open on mobile */}
      {isOpen && (
        <div
          onClick={onToggle}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.2)',
            zIndex: 55,
          }}
          className="md:hidden"
        />
      )}
    </>
  );
}

/* ─── Group sessions by time ─── */
function groupSessions(sessions: ChatSession[]) {
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 7 * 86400000;

  const groups: { label: string; items: ChatSession[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'This Week', items: [] },
    { label: 'Older', items: [] },
  ];

  for (const s of sessions) {
    if (s.updatedAt >= todayStart) groups[0].items.push(s);
    else if (s.updatedAt >= yesterdayStart) groups[1].items.push(s);
    else if (s.updatedAt >= weekStart) groups[2].items.push(s);
    else groups[3].items.push(s);
  }

  return groups.filter((g) => g.items.length > 0);
}
