'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Message2, Chart2 } from 'iconsax-reactjs';
import RiskBadge from '@/components/dashboard/RiskBadge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type Student = {
    id: string; name: string; studentId: string; grade: string; subject?: string | null;
    attendanceRate: number; gpa: number; assignmentCompletion: number;
    behaviorReferrals: number; lateSubmissions: number; notes?: string | null;
    tags?: string[] | null; lastRiskScore?: number | null; lastRiskCategory?: string | null;
    lastAnalyzedAt?: string | null;
};

function generateTrend(lastScore: number) {
    const base = Math.max(0, lastScore - 20);
    return [
        { week: 'Wk 1', risk: Math.round(Math.min(100, Math.max(0, base + Math.random() * 10))) },
        { week: 'Wk 2', risk: Math.round(Math.min(100, Math.max(0, base + 5 + Math.random() * 10))) },
        { week: 'Wk 3', risk: Math.round(Math.min(100, Math.max(0, base + 8 + Math.random() * 12))) },
        { week: 'Wk 4', risk: lastScore },
    ];
}

export default function StudentProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/students/${id}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { setStudent(data); setLoading(false); });
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center' as const, padding: 64, fontFamily: 'Inter, system-ui, sans-serif', color: 'rgba(35,6,3,0.4)' }}>Loading...</div>;
    if (!student) return <div style={{ textAlign: 'center' as const, padding: 64, fontFamily: 'Inter, system-ui, sans-serif', color: 'rgba(35,6,3,0.4)' }}>Student not found. <Link href="/dashboard/students" style={{ color: '#800532' }}>Back to roster</Link></div>;

    const trend = generateTrend(student.lastRiskScore ?? 40);

    const Metric = ({ label, value, warn }: { label: string; value: string; warn?: boolean }) => (
        <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '16px 20px', border: `1px solid ${warn ? 'rgba(192,57,43,0.2)' : 'rgba(35,6,3,0.06)'}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: warn ? '#C0392B' : 'rgba(35,6,3,0.4)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: warn ? '#C0392B' : '#230603', letterSpacing: '-0.8px' }}>{value}</div>
        </div>
    );

    return (
        <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <Link href="/dashboard/students" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, textDecoration: 'none', color: 'rgba(35,6,3,0.45)', fontSize: 13, fontWeight: 500 }}>
                <ArrowLeft size={16} /> Back to Students
            </Link>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#230603', margin: 0, letterSpacing: '-0.8px' }}>{student.name}</h1>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' as const }}>
                        <span style={{ fontSize: 13, color: 'rgba(35,6,3,0.45)' }}>Grade {student.grade}</span>
                        {student.subject && <span style={{ fontSize: 13, color: 'rgba(35,6,3,0.45)' }}>{student.subject}</span>}
                        <span style={{ fontSize: 13, color: 'rgba(35,6,3,0.35)' }}>ID: {student.studentId}</span>
                        {(student.tags ?? []).map((t: string) => (
                            <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, backgroundColor: 'rgba(128,5,50,0.08)', color: '#800532' }}>{t}</span>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <RiskBadge category={student.lastRiskCategory ?? 'Low'} score={student.lastRiskScore ?? undefined} />
                    <button onClick={() => router.push(`/dashboard?studentId=${student.id}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', backgroundColor: '#800532', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Message2 size={16} color="white" /> Analyze in Chat
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
                <Metric label="Attendance" value={`${student.attendanceRate}%`} warn={student.attendanceRate < 75} />
                <Metric label="GPA" value={student.gpa.toFixed(1)} warn={student.gpa < 2.0} />
                <Metric label="Assignments" value={`${student.assignmentCompletion}%`} warn={student.assignmentCompletion < 60} />
                <Metric label="Referrals" value={String(student.behaviorReferrals)} warn={student.behaviorReferrals >= 3} />
                <Metric label="Late Submissions" value={String(student.lateSubmissions)} warn={student.lateSubmissions >= 8} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgba(35,6,3,0.07)', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Chart2 size={18} color="#800532" variant="Bulk" />
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#230603', letterSpacing: '-0.3px' }}>Risk Trend (Last 4 Weeks)</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={trend}>
                            <defs>
                                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#800532" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#800532" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'rgba(35,6,3,0.4)' }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'rgba(35,6,3,0.4)' }} axisLine={false} tickLine={false} width={28} />
                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid rgba(35,6,3,0.1)', fontFamily: 'Inter' }} cursor={false} />
                            <Area type="monotone" dataKey="risk" stroke="#800532" strokeWidth={2} fill="url(#riskGrad)" dot={{ fill: '#800532', r: 3 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgba(35,6,3,0.07)', padding: '24px' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#230603', letterSpacing: '-0.3px' }}>Teacher Notes</h3>
                    {student.notes ? (
                        <p style={{ fontSize: 14, color: '#230603', lineHeight: 1.7, margin: 0 }}>{student.notes}</p>
                    ) : (
                        <p style={{ fontSize: 14, color: 'rgba(35,6,3,0.35)', fontStyle: 'italic', margin: 0 }}>No notes recorded.</p>
                    )}
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(35,6,3,0.07)' }}>
                        <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: 'rgba(35,6,3,0.5)' }}>Analysis History</h4>
                        <p style={{ fontSize: 13, color: 'rgba(35,6,3,0.35)', fontStyle: 'italic', margin: 0 }}>
                            {student.lastRiskScore !== null && student.lastRiskScore !== undefined
                                ? `Last analyzed — Risk score: ${student.lastRiskScore}, Category: ${student.lastRiskCategory}`
                                : 'No analyses yet. Click "Analyze in Chat" to run an assessment.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
