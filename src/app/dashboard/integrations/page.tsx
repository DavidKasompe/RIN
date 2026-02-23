"use client";

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link2, CheckCircle2, Loader2 } from 'lucide-react';
import { ShimmerCard } from '@/components/shared/Shimmer';

interface Toolkit {
    id: string;
    slug: string;
    name: string;
    icon: string;
    isConnected: boolean;
    connectedAccountId: string | null;
}

const PREFERRED_TOOLKITS = [
    // Communication
    { slug: 'gmail', title: 'Gmail', desc: 'Email Communications', fallbackIcon: 'logos:google-gmail', category: 'Communication' },
    { slug: 'slack', title: 'Slack', desc: 'Team Alerts & Channels', fallbackIcon: 'logos:slack-icon', category: 'Communication' },
    { slug: 'microsoft-teams', title: 'Microsoft Teams', desc: 'Team Chat & Meetings', fallbackIcon: 'logos:microsoft-teams', category: 'Communication' },
    { slug: 'outlook', title: 'Microsoft Outlook', desc: 'Email & Calendar', fallbackIcon: 'logos:microsoft-outlook', category: 'Communication' },

    // Calendar & Scheduling
    { slug: 'googlecalendar', title: 'Google Calendar', desc: 'Events & Meetings', fallbackIcon: 'logos:google-calendar', category: 'Calendar' },

    // LMS & Classroom
    { slug: 'googleclassroom', title: 'Google Classroom', desc: 'Assignments & Roster', fallbackIcon: 'logos:google-classroom', fallbackUrl: 'https://www.gstatic.com/classroom/logo_square_rounded.svg', category: 'LMS' },
    { slug: 'canvas', title: 'Canvas LMS', desc: 'Courses & Grades', fallbackIcon: 'simple-icons:instructure', category: 'LMS' },

    // Data & Reports
    { slug: 'googlesheets', title: 'Google Sheets', desc: 'Spreadsheets & Data', fallbackIcon: 'logos:google-sheets', category: 'Data' },
    { slug: 'excel', title: 'Microsoft Excel', desc: 'Workbooks & Charts', fallbackIcon: 'vscode-icons:file-type-excel', category: 'Data' },

    // Documents & Storage
    { slug: 'notion', title: 'Notion', desc: 'Documents & Workflows', fallbackIcon: 'logos:notion-icon', category: 'Documents' },
    { slug: 'googledrive', title: 'Google Drive', desc: 'File Storage & Sharing', fallbackIcon: 'logos:google-drive', category: 'Documents' },
];

export default function IntegrationsPage() {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [toolkits, setToolkits] = useState<Record<string, Toolkit>>({});
    const [isFetching, setIsFetching] = useState(true);
    const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
    const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

    useEffect(() => {
        async function loadIntegrations() {
            try {
                const res = await fetch('/api/integrations');
                const data = await res.json();
                if (data.available && data.items) {
                    const map: Record<string, Toolkit> = {};
                    data.items.forEach((t: any) => {
                        map[t.slug] = t;
                    });
                    setToolkits(map);
                }
            } catch (err) {
                console.error("Failed to load integrations", err);
            } finally {
                setIsFetching(false);
            }
        }
        loadIntegrations();
    }, []);

    const handleConnect = async (slug: string) => {
        setLoadingId(slug);
        try {
            const res = await fetch('/api/integrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toolkitSlug: slug })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Verification required or URL failed to generate.');
            }
        } catch (err) {
            console.error('Connection failed:', err);
        } finally {
            setLoadingId(null);
        }
    };

    const handleDisconnect = async (slug: string, connectedAccountId: string) => {
        setDisconnectingId(slug);
        try {
            const res = await fetch('/api/integrations', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectedAccountId })
            });
            const data = await res.json();
            if (data.success) {
                // Update local state to reflect disconnection
                setToolkits(prev => ({
                    ...prev,
                    [slug]: { ...prev[slug], isConnected: false, connectedAccountId: null }
                }));
            } else {
                alert('Failed to disconnect. Please try again.');
            }
        } catch (err) {
            console.error('Disconnect failed:', err);
        } finally {
            setDisconnectingId(null);
        }
    };

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", maxWidth: 1000, margin: '0 auto', paddingBottom: 64 }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: 'rgb(26,25,25)', margin: 0, letterSpacing: '-0.8px' }}>Integrations</h1>
                <p style={{ fontSize: 15, color: 'rgb(114,106,90)', margin: '6px 0 0' }}>Connect your favorite tools to supercharge the RIN Agent</p>
            </div>

            <style>{`
                .rin-integration-btn-connected {
                    transition: all 0.2s ease;
                }
                .rin-integration-btn-connected:hover {
                    background-color: rgba(220,38,38,0.06) !important;
                    border-color: rgba(220,38,38,0.3) !important;
                    color: #dc2626 !important;
                }
                .rin-integration-btn-connect:hover {
                    background-color: rgba(128,5,50,0.04) !important;
                    border-color: rgba(128,5,50,0.3) !important;
                }
            `}</style>

            {isFetching ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {Array.from({ length: 11 }).map((_, i) => (
                        <ShimmerCard key={i} hasIcon lines={2} style={{ height: 210, justifyContent: 'space-between' }} />
                    ))}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {PREFERRED_TOOLKITS.map((tk) => {
                        const composioData = toolkits[tk.slug];
                        const isConnected = composioData?.isConnected || false;
                        const logoUrl = composioData?.icon || null;
                        const isHovered = hoveredSlug === tk.slug;
                        const isDisconnecting = disconnectingId === tk.slug;

                        return (
                            <div key={tk.slug} style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgb(228,221,205)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(35,6,3,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {logoUrl ? (
                                                <img src={logoUrl} width={28} height={28} style={{ objectFit: 'contain' }} alt={tk.title} />
                                            ) : (tk as any).fallbackUrl ? (
                                                <img src={(tk as any).fallbackUrl} width={28} height={28} style={{ objectFit: 'contain' }} alt={tk.title} />
                                            ) : tk.fallbackIcon ? (
                                                <Icon icon={tk.fallbackIcon} width={28} height={28} />
                                            ) : (
                                                <div style={{ fontSize: 20 }}>⚡</div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'rgb(26,25,25)' }}>{composioData?.name || tk.title}</h3>
                                            <p style={{ margin: 0, fontSize: 13, color: 'rgb(114,106,90)' }}>{tk.desc}</p>
                                        </div>
                                    </div>
                                </div>
                                <p style={{ margin: 0, fontSize: 14, color: 'rgb(114,106,90)', lineHeight: 1.5 }}>
                                    {`Connect ${tk.title} to autonomously sync workflows.`}
                                </p>
                                <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                                    {isConnected ? (
                                        <button
                                            className="rin-integration-btn-connected"
                                            onClick={() => composioData?.connectedAccountId && handleDisconnect(tk.slug, composioData.connectedAccountId)}
                                            onMouseEnter={() => setHoveredSlug(tk.slug)}
                                            onMouseLeave={() => setHoveredSlug(null)}
                                            disabled={isDisconnecting}
                                            style={{
                                                width: '100%', padding: '10px',
                                                backgroundColor: isHovered ? 'rgba(220,38,38,0.06)' : 'rgba(5,128,80,0.08)',
                                                border: `1px solid ${isHovered ? 'rgba(220,38,38,0.3)' : 'rgba(5,128,80,0.2)'}`,
                                                borderRadius: 8, fontSize: 14, fontWeight: 600,
                                                color: isHovered ? '#dc2626' : '#058050',
                                                cursor: isDisconnecting ? 'wait' : 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                            }}
                                        >
                                            {isDisconnecting ? (
                                                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Disconnecting...</>
                                            ) : isHovered ? (
                                                <><Icon icon="lucide:unplug" width={16} /> Disconnect</>
                                            ) : (
                                                <><CheckCircle2 size={16} /> Connected</>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            className="rin-integration-btn-connect"
                                            onClick={() => handleConnect(tk.slug)}
                                            disabled={loadingId === tk.slug}
                                            style={{ width: '100%', padding: '10px', backgroundColor: 'white', border: '1px solid rgb(228,221,205)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#800532', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                        >
                                            {loadingId === tk.slug ? 'Connecting...' : <><Link2 size={16} /> Connect Account</>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Secured by Composio badge */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 32, padding: '14px 0',
                borderTop: '1px solid rgba(228,221,205,0.5)',
            }}>
                <Icon icon="lucide:shield-check" width={15} style={{ color: 'rgb(160,155,145)' }} />
                <span style={{ fontSize: 13, color: 'rgb(160,155,145)', fontWeight: 500 }}>Secured by</span>
                <a href="https://composio.dev" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <img src="/composio-logo.svg" alt="Composio" height={16} style={{ opacity: 0.45, transition: 'opacity 0.2s' }} onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')} onMouseLeave={e => (e.currentTarget.style.opacity = '0.45')} />
                </a>
            </div>
        </div>
    );
}
