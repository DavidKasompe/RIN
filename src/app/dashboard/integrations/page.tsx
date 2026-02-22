"use client";

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Link2 } from 'lucide-react';

export default function IntegrationsPage() {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleConnect = async (toolkit: string) => {
        setLoadingId(toolkit);
        // TODO: Initiate Composio Auth Flow
        setTimeout(() => {
            setLoadingId(null);
        }, 1500);
    };

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", maxWidth: 1000, margin: '0 auto', paddingBottom: 64 }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: 'rgb(26,25,25)', margin: 0, letterSpacing: '-0.8px' }}>Integrations</h1>
                <p style={{ fontSize: 15, color: 'rgb(114,106,90)', margin: '6px 0 0' }}>Connect your favorite tools to supercharge the RIN Agent</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                {/* Google Classroom */}
                <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgb(228,221,205)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src="https://www.gstatic.com/classroom/logo_square_rounded.svg" width={40} height={40} style={{ borderRadius: 8 }} alt="Classroom" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'rgb(26,25,25)' }}>Google Classroom</h3>
                                <p style={{ margin: 0, fontSize: 13, color: 'rgb(114,106,90)' }}>Assignments & Roster</p>
                            </div>
                        </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: 'rgb(114,106,90)', lineHeight: 1.5 }}>
                        Sync class schedules, assignments, and allow the agent to monitor student progress directly.
                    </p>
                    <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                        <button
                            onClick={() => handleConnect('googleclassroom')}
                            disabled={loadingId === 'googleclassroom'}
                            style={{ width: '100%', padding: '10px', backgroundColor: 'white', border: '1px solid rgb(228,221,205)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#800532', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            {loadingId === 'googleclassroom' ? 'Connecting...' : <><Link2 size={16} /> Connect Account</>}
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgb(228,221,205)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src="https://instructure-uploads.s3.amazonaws.com/account_1/attachments/221/canvas-logo.png" width={40} height={40} style={{ borderRadius: 8, objectFit: 'contain' }} alt="Canvas" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'rgb(26,25,25)' }}>Canvas LMS</h3>
                                <p style={{ margin: 0, fontSize: 13, color: 'rgb(114,106,90)' }}>Courses & Grades</p>
                            </div>
                        </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: 'rgb(114,106,90)', lineHeight: 1.5 }}>
                        Import student demographics, attendance records, and disciplinary history automatically.
                    </p>
                    <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                        <button
                            onClick={() => handleConnect('canvas')}
                            disabled={loadingId === 'canvas'}
                            style={{ width: '100%', padding: '10px', backgroundColor: 'white', border: '1px solid rgb(228,221,205)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#800532', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            {loadingId === 'canvas' ? 'Connecting...' : <><Link2 size={16} /> Connect Account</>}
                        </button>
                    </div>
                </div>

                {/* Gmail */}
                <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgb(228,221,205)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon icon="logos:google-gmail" width="28" height="28" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'rgb(26,25,25)' }}>Gmail</h3>
                                <p style={{ margin: 0, fontSize: 13, color: 'rgb(114,106,90)' }}>Email Communications</p>
                            </div>
                        </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: 'rgb(114,106,90)', lineHeight: 1.5 }}>
                        Allow the agent to autonomously email parents and guardians on your behalf.
                    </p>
                    <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                        <button
                            onClick={() => handleConnect('gmail')}
                            disabled={loadingId === 'gmail'}
                            style={{ width: '100%', padding: '10px', backgroundColor: 'white', border: '1px solid rgb(228,221,205)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#800532', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            {loadingId === 'gmail' ? 'Connecting...' : <><Link2 size={16} /> Connect Account</>}
                        </button>
                    </div>
                </div>

                {/* Google Calendar */}
                <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgb(228,221,205)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(66,133,244,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon icon="logos:google-calendar" width="24" height="24" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'rgb(26,25,25)' }}>Google Calendar</h3>
                                <p style={{ margin: 0, fontSize: 13, color: 'rgb(114,106,90)' }}>Events & Meetings</p>
                            </div>
                        </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: 'rgb(114,106,90)', lineHeight: 1.5 }}>
                        Sync intervention meetings, parent-teacher conferences, and academic events.
                    </p>
                    <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                        <button
                            onClick={() => handleConnect('googlecalendar')}
                            disabled={loadingId === 'googlecalendar'}
                            style={{ width: '100%', padding: '10px', backgroundColor: 'white', border: '1px solid rgb(228,221,205)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#800532', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            {loadingId === 'googlecalendar' ? 'Connecting...' : <><Link2 size={16} /> Connect Account</>}
                        </button>
                    </div>
                </div>

                {/* Notion Base */}
                <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgb(228,221,205)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(35,6,3,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon icon="ri:notion-fill" width="24" height="24" color="#230603" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'rgb(26,25,25)' }}>Notion Base</h3>
                                <p style={{ margin: 0, fontSize: 13, color: 'rgb(114,106,90)' }}>Documents & Workflows</p>
                            </div>
                        </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: 'rgb(114,106,90)', lineHeight: 1.5 }}>
                        Export reports, risk profiles, and intervention structures directly to Notion workspace.
                    </p>
                    <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                        <button
                            onClick={() => handleConnect('notion')}
                            disabled={loadingId === 'notion'}
                            style={{ width: '100%', padding: '10px', backgroundColor: 'white', border: '1px solid rgb(228,221,205)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#800532', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            {loadingId === 'notion' ? 'Connecting...' : <><Link2 size={16} /> Connect Account</>}
                        </button>
                    </div>
                </div>

                {/* Slack */}
                <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgb(228,221,205)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(74,21,75,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon icon="logos:slack-icon" width="24" height="24" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'rgb(26,25,25)' }}>Slack</h3>
                                <p style={{ margin: 0, fontSize: 13, color: 'rgb(114,106,90)' }}>Internal Team Alerts</p>
                            </div>
                        </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: 'rgb(114,106,90)', lineHeight: 1.5 }}>
                        Allow the agent to ping relevant counselors or educators in secure communication channels.
                    </p>
                    <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                        <button
                            onClick={() => handleConnect('slack')}
                            disabled={loadingId === 'slack'}
                            style={{ width: '100%', padding: '10px', backgroundColor: 'white', border: '1px solid rgb(228,221,205)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#800532', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            {loadingId === 'slack' ? 'Connecting...' : <><Link2 size={16} /> Connect Account</>}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
