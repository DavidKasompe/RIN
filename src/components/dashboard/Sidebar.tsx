'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getTeamDetailsAction } from '../../app/api/school/team';
import { useSession } from '@/lib/auth-client';
import {
    Message2,
    People,
    Chart2,
    Calendar,
    Diagram,
    Setting2,
    Category,
    Add,
    LogoutCurve,
    Check,
} from 'iconsax-reactjs';

const NAV_ITEMS = [
    { href: '/dashboard/students', label: 'Students', Icon: People },
    { href: '/dashboard/overview', label: 'Overview', Icon: Chart2 },
    { href: '/dashboard/calendar', label: 'Calendar', Icon: Calendar },
    { href: '/dashboard/workflows', label: 'Workflows', Icon: Diagram },
    { href: '/dashboard/integrations', label: 'Integrations', Icon: Category },
    { href: '/dashboard/settings', label: 'Settings', Icon: Setting2 },
];

const SIDEBAR_W = 220;

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [schoolName, setSchoolName] = useState('Loading...');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        async function fetchSchool() {
            try {
                const res = await getTeamDetailsAction();
                if (res.success && res.school) {
                    setSchoolName(res.school.name);
                } else {
                    setSchoolName('My Workspace');
                }
            } catch (error) {
                setSchoolName('My Workspace');
            }
        }
        fetchSchool();
    }, []);

    const isActive = (href: string) =>
        href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

    const startNewChat = () => {
        window.dispatchEvent(new CustomEvent('rin-new-chat'));
        router.push('/dashboard');
    };

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                className="md:hidden fixed top-3 left-4 z-[40] p-2 bg-[#FAF3EC]/80 backdrop-blur-md rounded-md shadow-sm border border-[rgba(35,6,3,0.1)] text-[#230603]"
                onClick={() => setIsMobileOpen(true)}
            >
                <Category size={20} color="#230603" variant="Bulk" />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/40 z-[55] backdrop-blur-sm" 
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <nav 
                className={`fixed md:sticky top-0 left-0 h-screen bg-[rgb(245,245,244)] border-r border-[rgba(35,6,3,0.06)] flex flex-col z-[60] md:z-50 transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
                style={{
                    width: SIDEBAR_W,
                    minWidth: SIDEBAR_W,
                    flexShrink: 0,
                    fontFamily: "'DM Sans', 'DM Sans Fallback', system-ui, -apple-system, sans-serif",
                }}
            >
                {/* Close Button for Mobile inside Sidebar */}
                {isMobileOpen && (
                    <button 
                        className="md:hidden absolute top-4 right-4 p-1.5 rounded-md bg-[rgba(35,6,3,0.05)] text-[#230603] z-[65]"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                )}
            {/* Top — Workspace Switcher */}
            <div style={{ padding: '16px 12px', paddingBottom: 12, position: 'relative' }}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px',
                        backgroundColor: isDropdownOpen ? 'rgba(35,6,3,0.05)' : 'transparent',
                        border: '1px solid transparent',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(35,6,3,0.05)'}
                    onMouseLeave={e => { if (!isDropdownOpen) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: 6,
                            backgroundColor: '#800532', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 700, flexShrink: 0
                        }}>
                            {schoolName === 'Loading...' ? '...' : schoolName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden', textAlign: 'left' }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'rgb(26,25,25)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                                {schoolName}
                            </span>
                            <span style={{ fontSize: 11, color: 'rgb(114,106,90)', fontWeight: 500 }}>
                                Pro Plan
                            </span>
                        </div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgb(114,106,90)', flexShrink: 0, transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </button>

                {isDropdownOpen && (
                    <>
                        {/* Overlay to catch clicks outside */}
                        <div
                            style={{ position: 'fixed', inset: 0, zIndex: 100 }}
                            onClick={() => setIsDropdownOpen(false)}
                        />
                        {/* Dropdown Menu */}
                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% - 8px)',
                            left: 12,
                            width: 260,
                            backgroundColor: 'white',
                            borderRadius: 12,
                            boxShadow: '0 12px 24px -8px rgba(35,6,3,0.15)',
                            border: '1px solid rgba(35,6,3,0.08)',
                            padding: 8,
                            zIndex: 101,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4
                        }}>
                            <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'rgba(35,6,3,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Workspaces
                            </div>
                            <button style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                                borderRadius: 8, border: 'none', backgroundColor: 'rgba(128,5,50,0.06)', cursor: 'default'
                            }}>
                                <div style={{
                                    width: 24, height: 24, borderRadius: 6, backgroundColor: '#800532', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700
                                }}>
                                    {schoolName === 'Loading...' ? '...' : schoolName.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#230603' }}>{schoolName}</span>
                                <Check size={16} color="#800532" style={{ marginLeft: 'auto' }} />
                            </button>
                            <div style={{ height: 1, backgroundColor: 'rgba(35,6,3,0.06)', margin: '4px 0' }} />
                            <button
                                onClick={() => {
                                    setIsDropdownOpen(false);
                                    router.push('/onboarding');
                                }}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                                    borderRadius: 8, border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
                                    color: 'rgba(35,6,3,0.6)', fontSize: 14, fontWeight: 500,
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(35,6,3,0.04)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <Add size={18} color="rgba(35,6,3,0.6)" variant="Linear" />
                                Create new workspace
                            </button>
                        </div>
                    </>
                )}
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
                            <span style={{ fontSize: 14, fontWeight: 500, color: 'rgb(41,37,36)' }}>{session?.user ? session.user.name.charAt(0).toUpperCase() : 'E'}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, color: 'rgb(41,37,36)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.user ? session.user.name : 'Educator'}</div>
                            <div style={{ fontSize: 12, color: 'rgb(114,106,90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                                {/* @ts-ignore custom role field */}
                                {session?.user?.role || 'Member'}
                            </div>
                        </div>
                        <button onClick={() => router.push('/signin')} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(35,6,3,0.4)', display: 'flex', alignItems: 'center' }}>
                            <LogoutCurve size={16} color="rgb(114,106,90)" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
        </>
    );
}
