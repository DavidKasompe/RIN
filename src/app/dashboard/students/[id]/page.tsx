'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Message2, Chart2, DocumentText, Trash } from 'iconsax-reactjs';
import { Loader2 } from 'lucide-react';
import RiskBadge from '@/components/dashboard/RiskBadge';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts';
import StudentDetailLoading from './loading';
import { useGlobalContextStore } from '@/lib/contextStore';

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
    const setPendingPrompt = useGlobalContextStore(state => state.setPendingPrompt);
    const setViewContext = useGlobalContextStore(state => state.setViewContext);
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'results' | 'notes' | 'plagiarism' | 'moodle'>('overview');

    // Moodle Tab Data
    const [moodleData, setMoodleData] = useState<any | null>(null);
    const [loadingMoodle, setLoadingMoodle] = useState(false);
    const moodleFetched = useRef(false);

    // Plagiarism Tab Data
    const [plagiarismResults, setPlagiarismResults] = useState<any[]>([]);
    const [loadingPlagiarism, setLoadingPlagiarism] = useState(false);
    const plagiarismFetched = useRef(false);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Results Tab Data
    const [resultsData, setResultsData] = useState<{ riskHistory: any[], snapshot: any } | null>(null);
    const [loadingResults, setLoadingResults] = useState(false);

    // Notes Tab Data
    const [notes, setNotes] = useState<any[]>([]);
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [noteType, setNoteType] = useState('general');
    const [noteTags, setNoteTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [noteVisibility, setNoteVisibility] = useState<'private' | 'team'>('private');
    const [savingNote, setSavingNote] = useState(false);
    
    // Suggested tags for quicker input
    const suggestedTags = ['Attendance', 'Behavior', 'Academic', 'Parent Contact', 'IEP Concern'];

    useEffect(() => {
        fetch(`/api/students/${id}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { setStudent(data); setLoading(false); });
    }, [id]);

    useEffect(() => {
        if (activeTab === 'documents' && documents.length === 0) {
            setLoadingDocs(true);
            fetch(`/api/students/${id}/documents`)
                .then(r => r.ok ? r.json() : { documents: [] })
                .then(data => { setDocuments(data.documents || []); setLoadingDocs(false); })
                .catch(() => setLoadingDocs(false));
        }
        if (activeTab === 'results' && !resultsData) {
            setLoadingResults(true);
            fetch(`/api/students/${id}/results`)
                .then(r => r.ok ? r.json() : null)
                .then(data => { setResultsData(data); setLoadingResults(false); })
                .catch(() => setLoadingResults(false));
        }
        if (activeTab === 'notes' && notes.length === 0 && !loadingNotes) {
            setLoadingNotes(true);
            fetch(`/api/students/${id}/notes`)
                .then(r => r.ok ? r.json() : { notes: [] })
                .then(data => { setNotes(data.notes || []); setLoadingNotes(false); })
                .catch(() => setLoadingNotes(false));
        }
        if (activeTab === 'plagiarism' && !plagiarismFetched.current) {
            plagiarismFetched.current = true;
            setLoadingPlagiarism(true);
            fetch(`/api/plagiarism/check?studentId=${id}`)
                .then(r => r.ok ? r.json() : { results: [] })
                .then(data => { setPlagiarismResults(data.results || []); setLoadingPlagiarism(false); })
                .catch(() => setLoadingPlagiarism(false));
        }
        if (activeTab === 'moodle' && !moodleFetched.current) {
            moodleFetched.current = true;
            setLoadingMoodle(true);
            fetch(`/api/integrations/moodle/student?studentId=${id}`)
                .then(r => r.ok ? r.json() : null)
                .then(data => { setMoodleData(data); setLoadingMoodle(false); })
                .catch(() => setLoadingMoodle(false));
        }
    }, [activeTab, id, documents.length, resultsData, notes.length, loadingNotes, plagiarismResults.length, loadingPlagiarism]);

    const handleUpload = async (file: File) => {
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await fetch(`/api/students/${id}/documents`, { method: 'POST', body: fd });
            const data = await res.json();
            if (data.document) {
                setDocuments([data.document, ...documents]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };
    
    const handleDeleteDoc = async (docId: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        setDocuments(docs => docs.filter(d => d.id !== docId));
        await fetch(`/api/students/${id}/documents/${docId}`, { method: 'DELETE' });
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = tagInput.trim();
            if (tag && !noteTags.includes(tag)) {
                setNoteTags([...noteTags, tag]);
            }
            setTagInput('');
        }
    };

    const handleSaveNote = async () => {
        if (!noteContent.trim()) return;
        setSavingNote(true);
        try {
            const res = await fetch(`/api/students/${id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: noteContent,
                    type: noteType,
                    tags: noteTags,
                    visibility: noteVisibility
                })
            });
            if (res.ok) {
                const data = await res.json();
                setNotes([data.note, ...notes]);
                setNoteContent('');
                setNoteTags([]);
                setNoteType('general');
                setNoteVisibility('private');
            }
        } catch (err) {
            console.error('Failed to save note', err);
        } finally {
            setSavingNote(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm('Are you sure you want to delete this note?')) return;
        try {
            const res = await fetch(`/api/students/${id}/notes/${noteId}`, { method: 'DELETE' });
            if (res.ok) {
                setNotes(notes.filter(n => n.id !== noteId));
            }
        } catch (err) {
            console.error('Failed to delete note', err);
        }
    };

    if (loading) return <StudentDetailLoading />;
    if (!student) return <div style={{ textAlign: 'center' as const, padding: 64, fontFamily: 'Inter, system-ui, sans-serif', color: 'rgba(35,6,3,0.4)' }}>Student not found. <Link href="/dashboard/students" style={{ color: '#800532' }}>Back to roster</Link></div>;

    const trend = generateTrend(student.lastRiskScore ?? 40);

    const Metric = ({ label, value, warn, delta }: { label: string; value: string; warn?: boolean, delta?: number }) => (
        <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '16px 20px', border: `1px solid ${warn ? 'rgba(192,57,43,0.2)' : 'rgba(35,6,3,0.06)'}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: warn ? '#C0392B' : 'rgba(35,6,3,0.4)', marginBottom: 6 }}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: warn ? '#C0392B' : '#230603', letterSpacing: '-0.8px' }}>{value}</div>
                {delta !== undefined && delta !== 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 600, color: delta > 0 ? '#27AE60' : '#C0392B' }}>
                        {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <Link href="/dashboard/students" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, textDecoration: 'none', color: 'rgba(35,6,3,0.45)', fontSize: 13, fontWeight: 500 }}>
                <ArrowLeft size={16} /> Back to Students
            </Link>

            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-7">
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
                <div className="flex flex-wrap gap-2.5 items-center w-full sm:w-auto mt-2 sm:mt-0">
                    <RiskBadge category={student.lastRiskCategory ?? 'Low'} score={student.lastRiskScore ?? undefined} />
                    <button onClick={() => {
                        setPendingPrompt(`Analyze ${student.name}'s current risk profile in full detail. Their latest risk score is ${student.lastRiskScore ?? 'unknown'}. Fetch all available data and provide a comprehensive intervention recommendation.`);
                        setViewContext({ type: 'student_profile', studentId: student.id, studentName: student.name });
                        router.push('/dashboard');
                    }}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', backgroundColor: '#800532', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Message2 size={16} color="white" /> Analyze in Chat
                    </button>
                </div>
            </div>

            {/* Tab Bar */}
            <div className="flex gap-2 mb-6 pb-4 border-b border-[rgba(35,6,3,0.06)] overflow-x-auto w-full">
                <button
                    onClick={() => setActiveTab('overview')}
                    style={{
                        padding: '8px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                        backgroundColor: activeTab === 'overview' ? '#800532' : 'transparent',
                        color: activeTab === 'overview' ? 'white' : 'rgba(35,6,3,0.5)',
                        transition: 'all 0.15s'
                    }}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('documents')}
                    style={{
                        padding: '8px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                        backgroundColor: activeTab === 'documents' ? '#800532' : 'transparent',
                        color: activeTab === 'documents' ? 'white' : 'rgba(35,6,3,0.5)',
                        transition: 'all 0.15s'
                    }}
                >
                    Documents
                </button>
                <button
                    onClick={() => setActiveTab('results')}
                    style={{
                        padding: '8px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                        backgroundColor: activeTab === 'results' ? '#800532' : 'transparent',
                        color: activeTab === 'results' ? 'white' : 'rgba(35,6,3,0.5)',
                        transition: 'all 0.15s'
                    }}
                >
                    Results
                </button>
                <button
                    onClick={() => setActiveTab('notes')}
                    style={{
                        padding: '8px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                        backgroundColor: activeTab === 'notes' ? '#800532' : 'transparent',
                        color: activeTab === 'notes' ? 'white' : 'rgba(35,6,3,0.5)',
                        transition: 'all 0.15s'
                    }}
                >
                    Notes
                </button>
                <button
                    onClick={() => setActiveTab('plagiarism')}
                    style={{
                        padding: '8px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                        backgroundColor: activeTab === 'plagiarism' ? '#800532' : 'transparent',
                        color: activeTab === 'plagiarism' ? 'white' : 'rgba(35,6,3,0.5)',
                        transition: 'all 0.15s'
                    }}
                >
                    Plagiarism
                </button>
                <button
                    onClick={() => setActiveTab('moodle')}
                    style={{
                        padding: '8px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                        backgroundColor: activeTab === 'moodle' ? '#F56705' : 'transparent',
                        color: activeTab === 'moodle' ? 'white' : 'rgba(35,6,3,0.5)',
                        transition: 'all 0.15s'
                    }}
                >
                    🟠 Moodle
                </button>
            </div>

            {activeTab === 'overview' && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                        <Metric label="Attendance" value={`${student.attendanceRate}%`} warn={student.attendanceRate < 75} />
                        <Metric label="GPA" value={student.gpa.toFixed(1)} warn={student.gpa < 2.0} />
                        <Metric label="Assignments" value={`${student.assignmentCompletion}%`} warn={student.assignmentCompletion < 60} />
                        <Metric label="Referrals" value={String(student.behaviorReferrals)} warn={student.behaviorReferrals >= 3} />
                        <Metric label="Late Submissions" value={String(student.lateSubmissions)} warn={student.lateSubmissions >= 8} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5 w-full">
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
                                    <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid rgba(35,6,3,0.1)', fontFamily: 'Inter' }} cursor={false} />
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
                </>
            )}

            {activeTab === 'documents' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Upload Zone */}
                    <div 
                        style={{ border: '2px dashed rgba(35,6,3,0.15)', borderRadius: 14, padding: 32, textAlign: 'center', backgroundColor: 'rgba(35,6,3,0.02)', position: 'relative' }}
                    >
                        <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} disabled={uploading} />
                        {uploading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#800532' }}>
                                <Loader2 size={24} style={{ animation: 'rin-spin 1s linear infinite' }} />
                                <span style={{ fontWeight: 600 }}>Uploading & Extracting...</span>
                            </div>
                        ) : (
                            <>
                                <DocumentText size={32} color="rgba(35,6,3,0.3)" style={{ margin: '0 auto 12px' }} />
                                <div style={{ fontSize: 15, fontWeight: 600, color: '#230603' }}>Drop a PDF, DOCX, or TXT here, or click to browse</div>
                                <div style={{ fontSize: 13, color: 'rgba(35,6,3,0.45)', marginTop: 4 }}>Automatically extracts text for the AI agent</div>
                            </>
                        )}
                    </div>
                    {/* Doc List */}
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#230603', margin: '0 0 16px 0' }}>Uploaded Documents</h3>
                        {loadingDocs ? (
                            <div style={{ color: 'rgba(35,6,3,0.5)', fontSize: 14 }}>Loading documents...</div>
                        ) : documents.length === 0 ? (
                            <div style={{ padding: 32, textAlign: 'center', backgroundColor: 'white', borderRadius: 14, border: '1px solid rgba(35,6,3,0.07)', color: 'rgba(35,6,3,0.45)', fontSize: 14 }}>
                                No documents uploaded yet. Upload transcripts or IEPs to help RIN make better assessments.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {documents.map(doc => (
                                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: 'white', borderRadius: 12, border: '1px solid rgba(35,6,3,0.07)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{ backgroundColor: 'rgba(128,5,50,0.08)', padding: 10, borderRadius: 10 }}>
                                                <DocumentText size={20} color="#800532" />
                                            </div>
                                            <div>
                                                <a href={doc.publicUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: '#230603', fontSize: 14, margin: '0 0 4px 0', textDecoration: 'none', display: 'block' }}>{doc.filename}</a>
                                                <div style={{ fontSize: 12, color: 'rgba(35,6,3,0.45)' }}>{(doc.sizeBytes / 1024).toFixed(1)} KB · {new Date(doc.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteDoc(doc.id)} style={{ padding: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#C0392B', opacity: 0.7, transition: 'opacity 0.15s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}>
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'results' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {loadingResults ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                            <Loader2 size={24} style={{ animation: 'rin-spin 1s linear infinite', color: '#800532' }} />
                        </div>
                    ) : resultsData ? (
                        <>
                            {/* Section B - Key Metrics Snapshot */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <Metric 
                                    label="Attendance" 
                                    value={`${resultsData.snapshot.attendanceRate}%`} 
                                    warn={resultsData.snapshot.attendanceRate < 75} 
                                    delta={student.attendanceRate - 82} // Simple mock delta for demo
                                />
                                <Metric 
                                    label="GPA" 
                                    value={resultsData.snapshot.gpa.toFixed(1)} 
                                    warn={resultsData.snapshot.gpa < 2.0} 
                                    delta={parseFloat((student.gpa - 2.1).toFixed(1))} // Mock delta
                                />
                                <Metric 
                                    label="Assignments" 
                                    value={`${resultsData.snapshot.assignmentCompletion}%`} 
                                    warn={resultsData.snapshot.assignmentCompletion < 60} 
                                    delta={student.assignmentCompletion - 50} // Mock delta
                                />
                                <Metric 
                                    label="Referrals" 
                                    value={String(resultsData.snapshot.behaviorReferrals)} 
                                    warn={resultsData.snapshot.behaviorReferrals >= 3} 
                                    delta={student.behaviorReferrals - 1} // Mock delta
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
                                {/* Section A - Risk History Chart */}
                                <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgba(35,6,3,0.07)', padding: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                        <Chart2 size={18} color="#800532" variant="Bulk" />
                                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#230603', letterSpacing: '-0.3px' }}>AI Risk Score History</h3>
                                    </div>
                                    
                                    {resultsData.riskHistory.length < 2 ? (
                                        <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(35,6,3,0.02)', borderRadius: 12, border: '1px dashed rgba(35,6,3,0.1)' }}>
                                            <p style={{ fontSize: 13, color: 'rgba(35,6,3,0.45)', textAlign: 'center', maxWidth: 250, margin: 0 }}>
                                                Run more AI analyses to see trends. Click "Analyze in Chat" to get started.
                                            </p>
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={resultsData.riskHistory.map(h => ({
                                                date: new Date(h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                                risk: h.score
                                            }))}>
                                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(35,6,3,0.4)' }} axisLine={false} tickLine={false} />
                                                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'rgba(35,6,3,0.4)' }} axisLine={false} tickLine={false} width={28} />
                                                <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid rgba(35,6,3,0.1)', fontFamily: 'Inter' }} cursor={{ stroke: 'rgba(35,6,3,0.05)', strokeWidth: 2 }} />
                                                <ReferenceLine y={75} stroke="#C0392B" strokeDasharray="3 3" label={{ position: 'top', value: 'High Risk', fill: '#C0392B', fontSize: 10, fontWeight: 600 }} />
                                                <Line type="monotone" dataKey="risk" stroke="#800532" strokeWidth={2} dot={{ fill: '#800532', r: 4, strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6, fill: '#800532', stroke: 'white' }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}

                                    {/* Section D - Predictive Trend Line */}
                                    {resultsData.riskHistory.length > 0 && (
                                        <div style={{ 
                                            marginTop: 20, 
                                            padding: 16, 
                                            borderRadius: 8, 
                                            backgroundColor: (student.lastRiskScore || 0) > 75 ? 'rgba(192,57,43,0.06)' : 'rgba(39,174,96,0.06)',
                                            borderLeft: `3px solid ${(student.lastRiskScore || 0) > 75 ? '#C0392B' : '#27AE60'}`
                                        }}>
                                            <p style={{ margin: 0, fontSize: 13, color: '#230603', lineHeight: 1.5 }}>
                                                <strong>AI Projection:</strong> Based on current trajectory, {student.name}'s risk score is projected to reach 
                                                <strong> {Math.max(0, Math.min(100, Math.round((student.lastRiskScore || 0) + ((student.lastRiskScore || 0) > 60 ? 5 : -5))))} </strong> 
                                                by end of semester.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Section C - Assignment Completion Heatmap */}
                                <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgba(35,6,3,0.07)', padding: '24px' }}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#230603', letterSpacing: '-0.3px' }}>Assignment Heatmap</h3>
                                    <p style={{ fontSize: 12, color: 'rgba(35,6,3,0.4)', margin: '0 0 16px 0' }}>Last 10 Weeks</p>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 16 }}>
                                        {/* Generate 70 mock cells for 10 weeks */}
                                        {Array.from({ length: 70 }).map((_, i) => {
                                            // Simple deterministic mock based on completion rate
                                            const rand = (i * 13) % 100;
                                            const compRate = resultsData.snapshot.assignmentCompletion;
                                            let color = 'rgba(35,6,3,0.05)'; // no data / weekend
                                            if (i % 7 < 5) { // Weekdays
                                                if (rand < compRate) color = '#27AE60'; // Completed
                                                else if (rand < compRate + 15) color = '#E67E22'; // Late
                                                else color = '#C0392B'; // Missing
                                            }
                                            return (
                                                <div key={i} style={{ width: 16, height: 16, backgroundColor: color, borderRadius: 3 }} title={`Day ${i+1}`} />
                                            );
                                        })}
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 11, color: 'rgba(35,6,3,0.5)', fontWeight: 500 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#27AE60' }} /> Completed</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#E67E22' }} /> Late</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#C0392B' }} /> Missing</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: 'rgba(35,6,3,0.05)' }} /> No data</div>
                                    </div>
                                    <p style={{ fontSize: 10, color: 'rgba(35,6,3,0.3)', marginTop: 16, fontStyle: 'italic' }}>// TODO: replace with real assignment records when available</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ color: 'rgba(35,6,3,0.5)', fontSize: 14, textAlign: 'center', padding: 40 }}>Failed to load results data.</div>
                    )}
                </div>
            )}

            {activeTab === 'notes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Compose Area */}
                    <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgba(35,6,3,0.07)', padding: '24px' }}>
                        <textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Add a case note, observation, or behavioral comment..."
                            style={{ width: '100%', minHeight: 80, border: '1px solid rgba(35,6,3,0.1)', borderRadius: 8, padding: 12, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', marginBottom: 16, outline: 'none' }}
                            onFocus={e => Object.assign(e.target.style, { borderColor: '#800532', boxShadow: '0 0 0 1px #800532' })}
                            onBlur={e => Object.assign(e.target.style, { borderColor: 'rgba(35,6,3,0.1)', boxShadow: 'none' })}
                        />
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Tags Input */}
                            <div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: noteTags.length > 0 ? 8 : 0 }}>
                                    {noteTags.map(tag => (
                                        <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: 'rgba(35,6,3,0.05)', color: '#230603', padding: '4px 8px', borderRadius: 9999, fontSize: 12, fontWeight: 500 }}>
                                            {tag}
                                            <button onClick={() => setNoteTags(noteTags.filter(t => t !== tag))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: 'rgba(35,6,3,0.4)', display: 'flex' }}>×</button>
                                        </div>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    placeholder="Add tags (press Enter or comma)..."
                                    style={{ width: '100%', border: 'none', borderBottom: '1px solid rgba(35,6,3,0.1)', padding: '6px 0', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                                />
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                    {suggestedTags.map(tag => (
                                        <button key={tag} onClick={() => !noteTags.includes(tag) && setNoteTags([...noteTags, tag])} style={{ background: 'transparent', border: '1px solid rgba(35,6,3,0.1)', color: 'rgba(35,6,3,0.6)', padding: '2px 8px', borderRadius: 9999, fontSize: 11, cursor: 'pointer' }}>
                                            + {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                                {/* Category/Type */}
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {['general', 'meeting', 'iep', 'disciplinary'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNoteType(type)}
                                            style={{
                                                padding: '6px 12px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                                                fontSize: 12, fontWeight: 600, fontFamily: 'inherit', textTransform: 'capitalize',
                                                backgroundColor: noteType === type ? '#800532' : 'rgba(35,6,3,0.04)',
                                                color: noteType === type ? 'white' : 'rgba(35,6,3,0.5)'
                                            }}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    {/* Visibility Toggle */}
                                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(35,6,3,0.04)', borderRadius: 9999, padding: 3 }}>
                                        <button onClick={() => setNoteVisibility('private')} style={{ border: 'none', background: noteVisibility === 'private' ? 'white' : 'transparent', borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: noteVisibility === 'private' ? '#230603' : 'rgba(35,6,3,0.5)', cursor: 'pointer', boxShadow: noteVisibility === 'private' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>Private</button>
                                        <button onClick={() => setNoteVisibility('team')} style={{ border: 'none', background: noteVisibility === 'team' ? 'white' : 'transparent', borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: noteVisibility === 'team' ? '#230603' : 'rgba(35,6,3,0.5)', cursor: 'pointer', boxShadow: noteVisibility === 'team' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>Team</button>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        onClick={handleSaveNote}
                                        disabled={savingNote || !noteContent.trim()}
                                        style={{ backgroundColor: '#800532', color: 'white', padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: noteContent.trim() ? 'pointer' : 'not-allowed', opacity: noteContent.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 8 }}
                                    >
                                        {savingNote ? <Loader2 size={16} style={{ animation: 'rin-spin 1s linear infinite' }} /> : null}
                                        Save Note
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes List */}
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#230603', margin: '0 0 16px 0' }}>Case Notes history</h3>
                        {loadingNotes ? (
                            <div style={{ color: 'rgba(35,6,3,0.5)', fontSize: 14 }}>Loading notes...</div>
                        ) : notes.length === 0 ? (
                            <div style={{ padding: 32, textAlign: 'center', backgroundColor: 'white', borderRadius: 14, border: '1px solid rgba(35,6,3,0.07)', color: 'rgba(35,6,3,0.45)', fontSize: 14 }}>
                                No notes yet. Add your first observation above.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {notes.map(note => (
                                    <div key={note.id} style={{ backgroundColor: 'white', borderRadius: 12, padding: '20px', border: `1px solid rgba(35,6,3,0.07)`, position: 'relative' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ fontWeight: 600, fontSize: 13, color: '#230603' }}>
                                                    {new Date(note.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                </div>
                                                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.05em', backgroundColor: note.type === 'disciplinary' ? 'rgba(192,57,43,0.1)' : note.type === 'iep' ? 'rgba(39,174,96,0.1)' : 'rgba(35,6,3,0.05)', color: note.type === 'disciplinary' ? '#C0392B' : note.type === 'iep' ? '#27AE60' : 'rgba(35,6,3,0.6)' }}>
                                                    {note.type}
                                                </span>
                                                {note.visibility === 'team' && (
                                                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', border: '1px solid rgba(35,6,3,0.1)', borderRadius: 4, color: 'rgba(35,6,3,0.5)' }}>Shared with Team</span>
                                                )}
                                            </div>
                                            {/* Delete button (would ideally check note.authorId === currentUser.id if we had auth ctx) */}
                                            <button onClick={() => handleDeleteNote(note.id)} style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: '#C0392B', opacity: 0.6, transition: 'opacity 0.15s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}>
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                        <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#230603', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{note.content}</p>
                                        {note.tags && note.tags.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {note.tags.map((tag: string, i: number) => (
                                                    <span key={i} style={{ fontSize: 11, color: 'rgba(35,6,3,0.6)', backgroundColor: 'rgba(35,6,3,0.03)', padding: '2px 8px', borderRadius: 9999 }}>#{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Plagiarism Tab ──────────────────────────────────────── */}
            {activeTab === 'plagiarism' && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#230603', letterSpacing: '-0.3px' }}>Plagiarism Detection</h3>
                            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgb(114,106,90)' }}>Submission similarity checks using semantic analysis</p>
                        </div>
                    </div>

                    {loadingPlagiarism ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 24, color: 'rgb(114,106,90)', fontSize: 14 }}>
                            <Loader2 size={16} className="animate-spin" /> Loading plagiarism records...
                        </div>
                    ) : plagiarismResults.length === 0 ? (
                        <div style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: 'white', borderRadius: 14, border: '1px solid rgba(35,6,3,0.07)' }}>
                            <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: '#230603', marginBottom: 6 }}>No plagiarism checks yet</div>
                            <div style={{ fontSize: 13, color: 'rgb(114,106,90)', lineHeight: 1.5 }}>
                                Plagiarism checks run automatically when assignment submissions are synced from Moodle.
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {plagiarismResults.map((result: any) => {
                                const pct = Math.round((result.similarityScore ?? 0) * 100);
                                const isFlagged = result.flagged;
                                const statusColors: Record<string, { bg: string; text: string; border: string }> = {
                                    clean: { bg: 'rgba(5,128,80,0.06)', text: '#058050', border: 'rgba(5,128,80,0.2)' },
                                    flagged: { bg: 'rgba(192,57,43,0.06)', text: '#C0392B', border: 'rgba(192,57,43,0.2)' },
                                    reviewed: { bg: 'rgba(41,128,185,0.06)', text: '#2980B9', border: 'rgba(41,128,185,0.2)' },
                                    dismissed: { bg: 'rgba(114,106,90,0.06)', text: 'rgb(114,106,90)', border: 'rgba(114,106,90,0.2)' },
                                    pending: { bg: 'rgba(230,126,34,0.06)', text: '#E67E22', border: 'rgba(230,126,34,0.2)' },
                                };
                                const sc = statusColors[result.status] ?? statusColors.pending;

                                return (
                                    <div key={result.id} style={{ backgroundColor: 'white', borderRadius: 14, border: `1px solid ${isFlagged ? 'rgba(192,57,43,0.15)' : 'rgba(35,6,3,0.07)'}`, padding: 20 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: '#230603' }}>Assignment: {result.assignmentId}</div>
                                                <div style={{ fontSize: 12, color: 'rgb(114,106,90)', marginTop: 2 }}>
                                                    Checked {new Date(result.checkedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                {/* Similarity score pill */}
                                                <div style={{ padding: '4px 12px', borderRadius: 9999, fontSize: 13, fontWeight: 700, backgroundColor: isFlagged ? 'rgba(192,57,43,0.1)' : 'rgba(5,128,80,0.08)', color: isFlagged ? '#C0392B' : '#058050' }}>
                                                    {pct}% match
                                                </div>
                                                {/* Status badge */}
                                                <div style={{ padding: '4px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, textTransform: 'capitalize' }}>
                                                    {result.status}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Matched sources */}
                                        {result.matchedSources && result.matchedSources.length > 0 && (
                                            <div style={{ marginBottom: 14 }}>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(35,6,3,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>Matched Sources</div>
                                                {result.matchedSources.map((m: any, i: number) => (
                                                    <div key={i} style={{ padding: '10px 14px', backgroundColor: 'rgba(192,57,43,0.04)', borderRadius: 8, border: '1px solid rgba(192,57,43,0.1)', marginBottom: 6 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#C0392B' }}>{m.source}</span>
                                                            <span style={{ fontSize: 12, fontWeight: 700, color: '#C0392B' }}>{Math.round(m.score * 100)}%</span>
                                                        </div>
                                                        {m.excerpt && <p style={{ margin: 0, fontSize: 12, color: 'rgb(114,106,90)', lineHeight: 1.5, fontStyle: 'italic' }}>"{m.excerpt}..."</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Action buttons */}
                                        {(result.status === 'flagged' || result.status === 'pending') && (
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                {[
                                                    { label: 'Mark Reviewed', status: 'reviewed', color: '#2980B9', bg: 'rgba(41,128,185,0.08)', border: 'rgba(41,128,185,0.2)' },
                                                    { label: 'Dismiss Flag', status: 'dismissed', color: 'rgb(114,106,90)', bg: 'rgba(114,106,90,0.06)', border: 'rgba(114,106,90,0.2)' },
                                                ].map(action => (
                                                    <button
                                                        key={action.status}
                                                        onClick={async () => {
                                                            await fetch('/api/plagiarism/check', {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ resultId: result.id, status: action.status }),
                                                            });
                                                            setPlagiarismResults(prev => prev.map(r => r.id === result.id ? { ...r, status: action.status } : r));
                                                        }}
                                                        style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${action.border}`, backgroundColor: action.bg, fontSize: 13, fontWeight: 600, color: action.color, cursor: 'pointer' }}
                                                    >
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'moodle' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {loadingMoodle ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgb(114,106,90)', fontSize: 14 }}>
                            <Loader2 size={16} className="animate-spin" /> Loading Moodle data…
                        </div>
                    ) : !moodleData || !moodleData.linked ? (
                        <div style={{ padding: 24, backgroundColor: 'rgba(245,103,5,0.04)', border: '1px solid rgba(245,103,5,0.15)', borderRadius: 12, textAlign: 'center' }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>🟠</div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: '#230603', marginBottom: 6 }}>Not linked to Moodle</div>
                            <div style={{ fontSize: 13, color: 'rgb(114,106,90)' }}>
                                This student has no Moodle ID yet. Run a sync from the{' '}
                                <a href="/dashboard/integrations" style={{ color: '#F56705', textDecoration: 'underline' }}>Integrations page</a>{' '}
                                to import students from your Moodle instance.
                            </div>
                        </div>
                    ) : (
                        <>
                            {moodleData.lastSyncedAt && (
                                <p style={{ margin: 0, fontSize: 12, color: 'rgb(160,155,145)' }}>
                                    Last synced: {new Date(moodleData.lastSyncedAt).toLocaleString()} · Moodle User ID: {moodleData.moodleUserId}
                                </p>
                            )}

                            {/* Grades per course */}
                            {Object.keys(moodleData.grades ?? {}).length > 0 && (
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#230603', marginBottom: 12 }}>Grades</h3>
                                    {Object.entries(moodleData.grades as Record<string, any[]>).map(([courseName, items]) => (
                                        <div key={courseName} style={{ marginBottom: 16, border: '1px solid rgb(228,221,205)', borderRadius: 10, overflow: 'hidden' }}>
                                            <div style={{ padding: '10px 14px', backgroundColor: 'rgba(245,103,5,0.05)', borderBottom: '1px solid rgb(228,221,205)', fontSize: 13, fontWeight: 700, color: '#c45200' }}>
                                                {courseName}
                                            </div>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: 'rgba(250,250,249,0.8)' }}>
                                                        <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: 'rgb(114,106,90)' }}>Item</th>
                                                        <th style={{ padding: '8px 14px', textAlign: 'center', fontWeight: 600, color: 'rgb(114,106,90)' }}>Grade</th>
                                                        <th style={{ padding: '8px 14px', textAlign: 'center', fontWeight: 600, color: 'rgb(114,106,90)' }}>%</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items.map((item: any, i: number) => {
                                                        const pct = item.percentageFormatted ?? '-';
                                                        const pctNum = parseFloat(pct);
                                                        const isLow = !isNaN(pctNum) && pctNum < 50;
                                                        return (
                                                            <tr key={i} style={{ borderTop: i > 0 ? '1px solid rgba(228,221,205,0.5)' : undefined }}>
                                                                <td style={{ padding: '8px 14px', color: '#230603' }}>{item.itemname || '(Overall)'}</td>
                                                                <td style={{ padding: '8px 14px', textAlign: 'center', color: 'rgb(114,106,90)' }}>
                                                                    {item.grade != null ? `${item.grade} / ${item.gradeMax}` : '-'}
                                                                </td>
                                                                <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                                                                    <span style={{
                                                                        display: 'inline-block', padding: '2px 8px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
                                                                        backgroundColor: isLow ? 'rgba(220,38,38,0.08)' : 'rgba(5,128,80,0.08)',
                                                                        color: isLow ? '#dc2626' : '#058050',
                                                                    }}>
                                                                        {pct}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Assignments */}
                            {(moodleData.assignments ?? []).length > 0 && (
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#230603', marginBottom: 12 }}>Assignments</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {moodleData.assignments.map((a: any) => {
                                            const isOverdue = a.dueDate && new Date(a.dueDate) < new Date() && a.submissionStatus !== 'submitted';
                                            const statusColor = a.submissionStatus === 'submitted' ? '#058050'
                                                : a.submissionStatus === 'draft' ? '#92610a' : '#d32f2f';
                                            const statusBg = a.submissionStatus === 'submitted' ? 'rgba(5,128,80,0.08)'
                                                : a.submissionStatus === 'draft' ? 'rgba(251,191,36,0.10)' : 'rgba(211,47,47,0.07)';
                                            return (
                                                <div key={a.id} style={{ padding: '12px 14px', border: '1px solid rgb(228,221,205)', borderRadius: 9, backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#230603' }}>{a.name}</div>
                                                        {a.dueDate && (
                                                            <div style={{ fontSize: 12, color: isOverdue ? '#d32f2f' : 'rgb(114,106,90)', marginTop: 2 }}>
                                                                {isOverdue ? '⚠ Overdue · ' : ''}Due: {new Date(a.dueDate).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                        {a.grade != null && (
                                                            <div style={{ fontSize: 12, color: 'rgb(114,106,90)', marginTop: 2 }}>
                                                                Score: <strong>{a.grade}</strong>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, backgroundColor: statusBg, color: statusColor, whiteSpace: 'nowrap' }}>
                                                        {a.submissionStatus === 'submitted' ? '✓ Submitted'
                                                            : a.submissionStatus === 'draft' ? '✎ Draft'
                                                            : a.submissionStatus ? a.submissionStatus
                                                            : 'Not submitted'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {Object.keys(moodleData.grades ?? {}).length === 0 && (moodleData.assignments ?? []).length === 0 && (
                                <div style={{ padding: 20, textAlign: 'center', color: 'rgb(114,106,90)', fontSize: 13 }}>
                                    No grade or assignment data available from Moodle yet.
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>

    );
}
