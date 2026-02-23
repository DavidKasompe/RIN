"use client";

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link2, CheckCircle2 } from 'lucide-react';
import { ShimmerCard } from '@/components/shared/Shimmer';

interface Toolkit {
    id: string;
    slug: string;
    name: string;
    icon: string;
    isConnected: boolean;
}

const PREFERRED_TOOLKITS = [
    { slug: 'googleclassroom', title: 'Google Classroom', desc: 'Assignments & Roster', fallbackIcon: 'logos:google-classroom' },
    { slug: 'canvas', title: 'Canvas LMS', desc: 'Courses & Grades', fallbackIcon: 'simple-icons:instructure' },
    { slug: 'gmail', title: 'Gmail', desc: 'Email Communications', fallbackIcon: 'logos:google-gmail' },
    { slug: 'googlecalendar', title: 'Google Calendar', desc: 'Events & Meetings', fallbackIcon: 'logos:google-calendar' },
    { slug: 'notion', title: 'Notion Base', desc: 'Documents & Workflows', fallbackIcon: 'logos:notion-icon' },
    { slug: 'slack', title: 'Slack', desc: 'Internal Team Alerts', fallbackIcon: 'logos:slack-icon' },
];

export default function IntegrationsPage() {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [toolkits, setToolkits] = useState<Record<string, Toolkit>>({});
    const [isFetching, setIsFetching] = useState(true);

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

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", maxWidth: 1000, margin: '0 auto', paddingBottom: 64 }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: 'rgb(26,25,25)', margin: 0, letterSpacing: '-0.8px' }}>Integrations</h1>
                <p style={{ fontSize: 15, color: 'rgb(114,106,90)', margin: '6px 0 0' }}>Connect your favorite tools to supercharge the RIN Agent</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                {isFetching ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <ShimmerCard key={i} hasIcon lines={2} style={{ height: 210, justifyContent: 'space-between' }} />
                    ))
                ) : PREFERRED_TOOLKITS.map((tk) => {
                    const composioData = toolkits[tk.slug];
                    const isConnected = composioData?.isConnected || false;
                    const logoUrl = composioData?.icon || null;

                    return (
                        <div key={tk.slug} style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgb(228,221,205)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(35,6,3,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {logoUrl ? (
                                            <img src={logoUrl} width={28} height={28} style={{ objectFit: 'contain' }} alt={tk.title} />
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
                                        disabled
                                        style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(5,128,80,0.08)', border: '1px solid rgba(5,128,80,0.2)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#058050', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                    >
                                        <CheckCircle2 size={16} /> Connected
                                    </button>
                                ) : (
                                    <button
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
        </div>
    );
}
