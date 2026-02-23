'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSchoolAction, joinSchoolAction } from '../api/school/actions';
import { Loader2 } from 'lucide-react';
import { Icon } from '@iconify/react';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [role, setRole] = useState('educator');
    const [schoolChoice, setSchoolChoice] = useState<'create' | 'join'>('create');
    const [schoolName, setSchoolName] = useState('');
    const [inviteCode, setInviteCode] = useState('');

    const handleNext = () => {
        setError('');
        setStep(s => s + 1);
    };

    const handleBack = () => {
        setError('');
        setStep(s => Math.max(1, s - 1));
    };

    const handleSubmit = async () => {
        setError('');
        setLoading(true);

        let res;
        if (schoolChoice === 'create') {
            if (!schoolName.trim()) {
                setError('School name is required.');
                setLoading(false);
                return;
            }
            res = await createSchoolAction(schoolName);
        } else {
            if (!inviteCode.trim()) {
                setError('Invite code is required.');
                setLoading(false);
                return;
            }
            res = await joinSchoolAction(inviteCode);
        }

        if (res.success) {
            // Proceed to the final Integrations step
            setStep(4);
        } else {
            setError(res.error || 'Something went wrong.');
        }
        setLoading(false);
    };

    const finishOnboarding = () => {
        router.push('/dashboard');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#FAF3EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div style={{
                width: '100%', maxWidth: step === 4 ? 760 : 560, margin: '0 24px',
                backgroundColor: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(128,5,50,0.08)',
                borderRadius: 24, padding: 48,
                boxShadow: '0 12px 32px rgba(35,6,3,0.04)'
            }}>

                {/* Header / Logo */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <span style={{
                        fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
                        fontSize: 28, fontWeight: 800, color: '#800532',
                        letterSpacing: '-1.5px', lineHeight: 1, userSelect: 'none'
                    }}>
                        RIN
                    </span>
                    {/* Progress dots */}
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 24 }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i === step ? '#800532' : 'rgba(128,5,50,0.15)', transition: 'all 0.3s ease' }} />
                        ))}
                    </div>
                </div>

                {/* --- STEP 1: Welcome --- */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#230603', marginBottom: 16, letterSpacing: '-0.5px', textAlign: 'center' }}>
                            Welcome to the team.
                        </h1>
                        <p style={{ fontSize: 16, color: 'rgba(35,6,3,0.6)', lineHeight: 1.6, textAlign: 'center', marginBottom: 40 }}>
                            Let's set up your workspace so you can start tracking student data, collaborating with colleagues, and identifying risk before it's too late.
                        </p>
                        <button
                            onClick={handleNext}
                            style={{ width: '100%', backgroundColor: '#800532', color: 'white', padding: 16, borderRadius: 12, fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            Get Started
                        </button>
                    </div>
                )}

                {/* --- STEP 2: Role & Route --- */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#230603', marginBottom: 24, letterSpacing: '-0.5px' }}>
                            How are you using RIN?
                        </h1>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                            {[
                                { id: 'educator', title: 'Teacher / Educator', desc: 'Managing a classroom or specific student roster.' },
                                { id: 'counselor', title: 'Counselor / Advisor', desc: 'Monitoring a caseload of at-risk students.' },
                                { id: 'administrator', title: 'Administrator', desc: 'Overseeing school-wide analytics and teams.' }
                            ].map(r => (
                                <label key={r.id} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 16, padding: 20,
                                    borderRadius: 16, border: `2px solid ${role === r.id ? '#800532' : 'rgba(128,5,50,0.1)'}`,
                                    backgroundColor: role === r.id ? 'rgba(128,5,50,0.02)' : 'white',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}>
                                    <input type="radio" name="role" value={r.id} checked={role === r.id} onChange={e => setRole(e.target.value)} style={{ marginTop: 4, accentColor: '#800532', width: 18, height: 18 }} />
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#230603', marginBottom: 4 }}>{r.title}</div>
                                        <div style={{ fontSize: 13, color: 'rgba(35,6,3,0.5)', lineHeight: 1.4 }}>{r.desc}</div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={handleBack} style={{ flex: 1, backgroundColor: 'transparent', color: '#600426', padding: 16, borderRadius: 12, fontSize: 15, fontWeight: 600, border: '1px solid rgba(128,5,50,0.2)', cursor: 'pointer' }}>Back</button>
                            <button onClick={handleNext} style={{ flex: 2, backgroundColor: '#800532', color: 'white', padding: 16, borderRadius: 12, fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Continue</button>
                        </div>
                    </div>
                )}

                {/* --- STEP 3: School Choice --- */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#230603', marginBottom: 8, letterSpacing: '-0.5px' }}>
                            Your School
                        </h1>
                        <p style={{ fontSize: 15, color: 'rgba(35,6,3,0.6)', marginBottom: 24, lineHeight: 1.5 }}>
                            Are you setting up a new school account, or joining an existing team?
                        </p>

                        <div style={{ display: 'flex', gap: 12, marginBottom: 24, backgroundColor: 'rgba(128,5,50,0.06)', padding: 6, borderRadius: 12 }}>
                            <button
                                onClick={() => setSchoolChoice('create')}
                                style={{
                                    flex: 1, padding: 12, borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                                    backgroundColor: schoolChoice === 'create' ? 'white' : 'transparent',
                                    color: schoolChoice === 'create' ? '#800532' : 'rgba(35,6,3,0.5)',
                                    boxShadow: schoolChoice === 'create' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                                }}>
                                Create New School
                            </button>
                            <button
                                onClick={() => setSchoolChoice('join')}
                                style={{
                                    flex: 1, padding: 12, borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                                    backgroundColor: schoolChoice === 'join' ? 'white' : 'transparent',
                                    color: schoolChoice === 'join' ? '#800532' : 'rgba(35,6,3,0.5)',
                                    boxShadow: schoolChoice === 'join' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                                }}>
                                Join with Invite Code
                            </button>
                        </div>

                        {schoolChoice === 'create' ? (
                            <div style={{ marginBottom: 32 }}>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#230603', marginBottom: 8 }}>School Name</label>
                                <input
                                    type="text"
                                    value={schoolName}
                                    onChange={e => setSchoolName(e.target.value)}
                                    placeholder="e.g. Lincoln High School"
                                    style={{ width: '100%', padding: '16px', borderRadius: 12, border: '1px solid rgba(128,5,50,0.15)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#800532'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(128,5,50,0.15)'}
                                />
                            </div>
                        ) : (
                            <div style={{ marginBottom: 32 }}>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#230603', marginBottom: 8 }}>Invite Code</label>
                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={e => setInviteCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. RIN-A1B2C3"
                                    style={{ width: '100%', padding: '16px', borderRadius: 12, border: '1px solid rgba(128,5,50,0.15)', fontSize: 15, outline: 'none', textTransform: 'uppercase', letterSpacing: '1px', transition: 'border-color 0.2s' }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#800532'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(128,5,50,0.15)'}
                                />
                            </div>
                        )}

                        {error && <div style={{ color: '#d32f2f', fontSize: 14, marginBottom: 16, backgroundColor: 'rgba(211,47,47,0.1)', padding: 12, borderRadius: 8 }}>{error}</div>}

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={handleBack} disabled={loading} style={{ flex: 1, backgroundColor: 'transparent', color: '#600426', padding: 16, borderRadius: 12, fontSize: 15, fontWeight: 600, border: '1px solid rgba(128,5,50,0.2)', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>Back</button>
                            <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, backgroundColor: '#800532', color: 'white', padding: 16, borderRadius: 12, fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.8 : 1 }}>
                                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Confirm & Save'}
                            </button>
                        </div>
                    </div>
                )}

                {/* --- STEP 4: Integrations Showcase --- */}
                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#230603', marginBottom: 12, letterSpacing: '-0.5px', textAlign: 'center' }}>
                            Connect Your Tools
                        </h1>
                        <p style={{ fontSize: 15, color: 'rgba(35,6,3,0.6)', marginBottom: 32, lineHeight: 1.5, textAlign: 'center' }}>
                            You're all set! Just so you know, RIN automatically integrates with the tools you already use to silently build risk profiles without extra data entry.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
                            {[
                                { icon: 'logos:google-gmail', name: 'Gmail' },
                                { icon: 'logos:slack-icon', name: 'Slack' },
                                { icon: 'logos:google-calendar', name: 'Calendar' },
                                { imgSrc: 'https://www.gstatic.com/classroom/logo_square_rounded.svg', name: 'Classroom' },
                                { icon: 'logos:google-sheets', name: 'Sheets' },
                                { icon: 'logos:google-drive', name: 'Drive' },
                                { icon: 'ri:notion-fill', name: 'Notion', color: '#230603' },
                                { icon: 'logos:microsoft-teams', name: 'Teams' },
                            ].map(int => (
                                <div key={int.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 16px', backgroundColor: 'white', borderRadius: 16, border: '1px solid rgba(128,5,50,0.1)' }}>
                                    {int.imgSrc ? (
                                        <img src={int.imgSrc} width={40} height={40} style={{ borderRadius: 8 }} alt={int.name} />
                                    ) : (
                                        <Icon icon={int.icon!} width="40" height="40" style={{ color: (int as any).color || undefined }} />
                                    )}
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#230603', textAlign: 'center' }}>{int.name}</span>
                                </div>
                            ))}
                            {/* "& more" card */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '24px 16px', backgroundColor: 'rgba(128,5,50,0.03)', borderRadius: 16, border: '1px dashed rgba(128,5,50,0.15)' }}>
                                <span style={{ fontSize: 22, fontWeight: 700, color: 'rgba(128,5,50,0.4)' }}>+3</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(35,6,3,0.4)', textAlign: 'center' }}>& more</span>
                            </div>
                        </div>
                        <button
                            onClick={finishOnboarding}
                            style={{ width: '100%', backgroundColor: '#800532', color: 'white', padding: 16, borderRadius: 12, fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
