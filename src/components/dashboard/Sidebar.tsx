'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Message2,
    People,
    Chart2,
    Calendar,
    Diagram,
    Setting2,
    Add,
    LogoutCurve,
} from 'iconsax-reactjs';

const NAV_ITEMS = [
    { href: '/dashboard/students', label: 'Students', Icon: People },
    { href: '/dashboard/overview', label: 'Overview', Icon: Chart2 },
    { href: '/dashboard/calendar', label: 'Calendar', Icon: Calendar },
    { href: '/dashboard/workflows', label: 'Workflows', Icon: Diagram },
    { href: '/dashboard/settings', label: 'Settings', Icon: Setting2 },
];

const SIDEBAR_W = 220;

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (href: string) =>
        href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

    const startNewChat = () => {
        window.dispatchEvent(new CustomEvent('rin-new-chat'));
        router.push('/dashboard');
    };

    return (
        <nav style={{
            width: SIDEBAR_W,
            minWidth: SIDEBAR_W,
            flexShrink: 0,
            height: '100vh',
            backgroundColor: 'rgb(245,245,244)',
            borderRight: '0.67px solid rgb(246,240,228)',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
            fontFamily: "'DM Sans', 'DM Sans Fallback', system-ui, -apple-system, sans-serif",
            zIndex: 50,
        }}>
            {/* Top — logo */}
            <div style={{ padding: '16px 12px', paddingBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Logo wordmark */}
                    <Link href="/dashboard" style={{ textDecoration: 'none', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                            fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
                            fontSize: 19, fontWeight: 800, color: '#800532',
                            letterSpacing: '-1.4px', lineHeight: 1,
                        }}>RIN</span>
                    </Link>
                </div>
            </div>

            {/* Primary actions */}
            <div style={{ padding: '0 12px' }}>
                {/* New Chat */}
                <button
                    onClick={startNewChat}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px', borderRadius: 6, border: 'none',
                        backgroundColor: 'rgb(243,240,236)', cursor: 'pointer',
                        fontSize: 14, fontWeight: 500, color: 'rgb(26,25,25)',
                        fontFamily: 'inherit', transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgb(237,233,228)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgb(243,240,236)')}
                >
                    <Add size={18} color="rgb(26,25,25)" />
                    <span>New chat</span>
                </button>

                {/* Chat link (current) */}
                <Link href="/dashboard" style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 6, marginTop: 4,
                    textDecoration: 'none',
                    color: isActive('/dashboard') ? 'rgb(26,25,25)' : 'rgb(41,37,36)',
                    backgroundColor: isActive('/dashboard') ? 'rgba(128,5,50,0.07)' : 'transparent',
                    fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
                    transition: 'background-color 0.15s',
                }}>
                    <Message2 size={18} variant={isActive('/dashboard') ? 'Bulk' : 'Linear'} color={isActive('/dashboard') ? '#800532' : 'rgb(41,37,36)'} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>AI Chat</span>
                </Link>

                {/* Divider */}
                <div style={{ height: 1, backgroundColor: 'rgba(35,6,3,0.06)', margin: '8px 0' }} />

                {/* Rest of nav */}
                {NAV_ITEMS.map(({ href, label, Icon }) => {
                    const active = isActive(href);
                    return (
                        <Link key={href} href={href} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 12px', borderRadius: 6, marginTop: 4,
                            textDecoration: 'none',
                            color: active ? 'rgb(26,25,25)' : 'rgb(41,37,36)',
                            backgroundColor: active ? 'rgba(128,5,50,0.07)' : 'transparent',
                            fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
                            transition: 'background-color 0.15s',
                        }}>
                            <Icon size={18} variant={active ? 'Bulk' : 'Linear'} color={active ? '#800532' : 'rgb(41,37,36)'} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Scrollable history area */}
            <div style={{
                flex: 1, overflowY: 'auto', minHeight: 0, marginTop: 24,
                scrollbarWidth: 'thin', scrollbarColor: 'rgba(114,106,90,0.3) transparent',
            }} />

            {/* Bottom — user pill + sign out */}
            <div style={{ marginTop: 'auto', padding: '16px 12px 0' }}>
                {/* "Try Projects" promo */}
                <div style={{
                    padding: 12, backgroundColor: 'rgb(246,240,228)', borderRadius: 12,
                    overflow: 'hidden', position: 'relative', marginBottom: 12, cursor: 'pointer',
                }}>
                    <div style={{ paddingRight: 40 }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'rgb(38,38,38)', lineHeight: '17.5px' }}>Students at risk</h3>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgb(82,82,82)', lineHeight: '16.5px' }}>View roster &amp; flag critical cases</p>
                    </div>
                    <div style={{ position: 'absolute', right: -12, bottom: -12, width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(128,5,50,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <People size={20} color="rgb(115,115,115)" />
                    </div>
                </div>

                {/* User pill */}
                <div style={{ padding: '10px 12px', marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '6px 8px', borderRadius: 6, margin: '-6px -8px', transition: 'background-color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(35,6,3,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        {/* Avatar */}
                        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgb(243,240,236)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 14, fontWeight: 500, color: 'rgb(41,37,36)' }}>E</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, color: 'rgb(41,37,36)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Educator</div>
                            <div style={{ fontSize: 12, color: 'rgb(114,106,90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Personal Account</div>
                        </div>
                        <button onClick={() => router.push('/signin')} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(35,6,3,0.4)', display: 'flex', alignItems: 'center' }}>
                            <LogoutCurve size={16} color="rgb(114,106,90)" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
