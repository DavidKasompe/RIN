'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Add, Import, SearchNormal1, ArrowUp2, ArrowDown2 } from 'iconsax-reactjs';
import RiskBadge from '@/components/dashboard/RiskBadge';
import { ShimmerTableRow } from '@/components/shared/Shimmer';
import { useGlobalContextStore } from '@/lib/contextStore';

// ─── Types ────────────────────────────────────────────────────────────────────
type Student = {
    id: string; name: string; studentId: string; grade: string; subject?: string | null;
    attendanceRate: number; gpa: number; assignmentCompletion: number;
    behaviorReferrals: number; lateSubmissions: number; notes?: string | null;
    tags?: string[] | null;
    lastRiskScore?: number | null; lastRiskCategory?: string | null;
};
type SortKey = 'name' | 'grade' | 'attendanceRate' | 'gpa' | 'assignmentCompletion' | 'lastRiskScore';
type SortDir = 'asc' | 'desc';

const GRADES = ['All Grades', '9', '10', '11', '12'];
const RISK_LEVELS = ['All Risk Levels', 'Critical', 'At Risk', 'Moderate', 'Low'];

export default function StudentsPage() {
    const router = useRouter();
    const setPendingPrompt = useGlobalContextStore(state => state.setPendingPrompt);
    const setViewContext = useGlobalContextStore(state => state.setViewContext);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [gradeFilter, setGradeFilter] = useState('All Grades');
    const [riskFilter, setRiskFilter] = useState('All Risk Levels');
    const [sortKey, setSortKey] = useState<SortKey>('lastRiskScore');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [showSlideOver, setShowSlideOver] = useState(false);
    const [showCSV, setShowCSV] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        const res = await fetch('/api/students');
        const data = await res.json();
        setStudents(data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    const filtered = students
        .filter(s => {
            const q = search.toLowerCase();
            if (q && !s.name.toLowerCase().includes(q) && !s.studentId.toLowerCase().includes(q)) return false;
            if (gradeFilter !== 'All Grades' && s.grade !== gradeFilter) return false;
            if (riskFilter !== 'All Risk Levels' && s.lastRiskCategory !== riskFilter) return false;
            return true;
        })
        .sort((a, b) => {
            const va = (a[sortKey] ?? 0) as string | number;
            const vb = (b[sortKey] ?? 0) as string | number;
            const cmp = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number);
            return sortDir === 'asc' ? cmp : -cmp;
        });

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const deleteStudent = async (id: string) => {
        await fetch(`/api/students/${id}`, { method: 'DELETE' });
        setStudents(s => s.filter(x => x.id !== id));
    };

    const SortIcon = ({ col }: { col: SortKey }) =>
        sortKey === col
            ? sortDir === 'asc' ? <ArrowUp2 size={12} color="#800532" /> : <ArrowDown2 size={12} color="#800532" />
            : <ArrowDown2 size={12} color="rgba(35,6,3,0.2)" />;

    const th = (label: string, col?: SortKey) => (
        <th onClick={col ? () => handleSort(col) : undefined}
            style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(35,6,3,0.4)', cursor: col ? 'pointer' : 'default', userSelect: 'none' as const, whiteSpace: 'nowrap' as const, borderBottom: '1px solid rgba(35,6,3,0.07)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{label}{col && <SortIcon col={col} />}</span>
        </th>
    );

    const atRiskCount = students.filter(s => s.lastRiskCategory === 'Critical' || s.lastRiskCategory === 'At Risk').length;
    const avgGpa = students.length ? (students.reduce((a, s) => a + s.gpa, 0) / students.length).toFixed(1) : '—';
    const avgAttendance = students.length ? Math.round(students.reduce((a, s) => a + s.attendanceRate, 0) / students.length) : 0;

    return (
        <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#230603', margin: 0, letterSpacing: '-0.8px' }}>Students</h1>
                    <p style={{ fontSize: 14, color: 'rgba(35,6,3,0.45)', margin: '4px 0 0' }}>{students.length} students in roster</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowCSV(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', backgroundColor: 'white', border: '1px solid rgba(35,6,3,0.12)', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#230603', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Import size={16} color="#230603" /> Import CSV
                    </button>
                    <button onClick={() => { setEditingStudent(null); setShowSlideOver(true); }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', backgroundColor: '#800532', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Add size={16} color="white" /> Add Student
                    </button>
                </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                    { label: 'Total Students', value: students.length },
                    { label: 'At Risk / Critical', value: atRiskCount, highlight: atRiskCount > 0 },
                    { label: 'Avg GPA', value: avgGpa },
                    { label: 'Avg Attendance', value: `${avgAttendance}%` },
                ].map(({ label, value, highlight }) => (
                    <div key={label} style={{ backgroundColor: 'white', borderRadius: 12, padding: '16px 20px', border: `1px solid ${highlight ? 'rgba(192,57,43,0.2)' : 'rgba(35,6,3,0.06)'}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: highlight ? '#C0392B' : 'rgba(35,6,3,0.4)', marginBottom: 6 }}>{label}</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: highlight ? '#C0392B' : '#230603', letterSpacing: '-1px' }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' as const }}>
                <div style={{ position: 'relative' as const, flex: 1, minWidth: 220, maxWidth: 320 }}>
                    <SearchNormal1 size={15} color="rgba(35,6,3,0.35)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..." style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 10, border: '1px solid rgba(35,6,3,0.12)', fontSize: 13, fontFamily: 'inherit', backgroundColor: 'white', color: '#230603', outline: 'none', boxSizing: 'border-box' as const }} />
                </div>
                <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)} style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(35,6,3,0.12)', fontSize: 13, fontFamily: 'inherit', backgroundColor: 'white', color: '#230603', cursor: 'pointer', outline: 'none' }}>
                    {GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
                <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(35,6,3,0.12)', fontSize: 13, fontFamily: 'inherit', backgroundColor: 'white', color: '#230603', cursor: 'pointer', outline: 'none' }}>
                    {RISK_LEVELS.map(r => <option key={r}>{r}</option>)}
                </select>
                <span style={{ fontSize: 13, color: 'rgba(35,6,3,0.4)', marginLeft: 4 }}>{filtered.length} showing</span>
            </div>

            {/* Table */}
            <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid rgba(35,6,3,0.07)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '0 24px', paddingBottom: 8 }}>
                        {Array.from({ length: 12 }).map((_, i) => <ShimmerTableRow key={i} cols={6} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '64px 32px', textAlign: 'center' as const }}>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#230603', marginBottom: 8 }}>No students found</div>
                        <div style={{ fontSize: 14, color: 'rgba(35,6,3,0.4)', marginBottom: 20 }}>Add students manually or import a CSV.</div>
                        <button onClick={() => setShowSlideOver(true)} style={{ padding: '10px 20px', backgroundColor: '#800532', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>Add First Student</button>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' as const }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                            <thead style={{ backgroundColor: 'rgba(250,243,236,0.6)' }}>
                                <tr>{th('Name', 'name')}{th('Grade', 'grade')}{th('Attendance', 'attendanceRate')}{th('GPA', 'gpa')}{th('Assignments', 'assignmentCompletion')}{th('Referrals')}{th('Risk', 'lastRiskScore')}{th('Actions')}</tr>
                            </thead>
                            <tbody>
                                {filtered.map((s, i) => (
                                    <tr key={s.id} style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(35,6,3,0.05)', backgroundColor: 'white', transition: 'background-color 0.1s' }}
                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(250,243,236,0.5)')}
                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}>
                                        <td style={{ padding: '13px 16px' }}>
                                            <Link href={`/dashboard/students/${s.id}`} style={{ textDecoration: 'none' }}>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: '#230603', letterSpacing: '-0.2px' }}>{s.name}</div>
                                                <div style={{ fontSize: 11, color: 'rgba(35,6,3,0.35)', marginTop: 2 }}>{s.studentId}</div>
                                            </Link>
                                        </td>
                                        <td style={{ padding: '13px 16px', fontSize: 13, color: 'rgba(35,6,3,0.6)' }}>Gr. {s.grade}</td>
                                        <td style={{ padding: '13px 16px' }}>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: s.attendanceRate < 75 ? '#C0392B' : s.attendanceRate < 85 ? '#C87A0A' : '#230603' }}>{s.attendanceRate.toFixed(0)}%</span>
                                        </td>
                                        <td style={{ padding: '13px 16px' }}>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: s.gpa < 2.0 ? '#C0392B' : s.gpa < 2.5 ? '#C87A0A' : '#230603' }}>{s.gpa.toFixed(1)}</span>
                                        </td>
                                        <td style={{ padding: '13px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ flex: 1, height: 4, backgroundColor: 'rgba(35,6,3,0.08)', borderRadius: 9999, maxWidth: 60 }}>
                                                    <div style={{ height: '100%', width: `${s.assignmentCompletion}%`, backgroundColor: s.assignmentCompletion < 60 ? '#C0392B' : s.assignmentCompletion < 75 ? '#E67E22' : '#27AE60', borderRadius: 9999 }} />
                                                </div>
                                                <span style={{ fontSize: 12, color: 'rgba(35,6,3,0.5)' }}>{s.assignmentCompletion.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '13px 16px', fontSize: 13, color: s.behaviorReferrals >= 3 ? '#C0392B' : 'rgba(35,6,3,0.6)', fontWeight: s.behaviorReferrals >= 3 ? 700 : 400 }}>{s.behaviorReferrals}</td>
                                        <td style={{ padding: '13px 16px' }}><RiskBadge category={s.lastRiskCategory ?? 'Low'} score={s.lastRiskScore ?? undefined} /></td>
                                        <td style={{ padding: '13px 16px' }}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => {
                                                    setPendingPrompt(`Analyze the current risk factors for ${s.name} (Grade ${s.grade}). Their attendance is ${s.attendanceRate}% and GPA is ${s.gpa}. Fetch their full profile and suggest a targeted intervention plan.`);
                                                    setViewContext({ type: 'student_profile', studentId: s.id, studentName: s.name });
                                                    router.push('/dashboard');
                                                }} style={{ padding: '5px 12px', backgroundColor: 'rgba(128,5,50,0.08)', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#800532', cursor: 'pointer', fontFamily: 'inherit' }}>Analyze</button>
                                                <button onClick={() => { setEditingStudent(s); setShowSlideOver(true); }} style={{ padding: '5px 12px', backgroundColor: 'rgba(35,6,3,0.05)', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#230603', cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                                                <button onClick={() => { if (confirm(`Remove ${s.name}?`)) deleteStudent(s.id); }} style={{ padding: '5px 12px', backgroundColor: 'rgba(192,57,43,0.07)', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#C0392B', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showSlideOver && (
                <StudentSlideOver
                    student={editingStudent}
                    onClose={() => { setShowSlideOver(false); setEditingStudent(null); }}
                    onSave={async (data) => {
                        if (editingStudent) {
                            await fetch(`/api/students/${editingStudent.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
                        } else {
                            await fetch('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
                        }
                        setShowSlideOver(false); setEditingStudent(null);
                        await fetchStudents();
                    }}
                />
            )}
            {showCSV && (
                <CSVModal
                    onClose={() => setShowCSV(false)}
                    onImport={async (rows) => {
                        for (const row of rows) {
                            await fetch('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row) });
                        }
                        setShowCSV(false);
                        await fetchStudents();
                    }}
                />
            )}
        </div>
    );
}

// ─── Student Slide-Over ───────────────────────────────────────────────────────
function StudentSlideOver({ student, onClose, onSave }: { student: Student | null; onClose: () => void; onSave: (data: Partial<Student>) => Promise<void> }) {
    const blank: Partial<Student> = { id: `stu-${Date.now()}`, name: '', studentId: '', grade: '9', subject: '', attendanceRate: 90, gpa: 3.0, assignmentCompletion: 85, behaviorReferrals: 0, lateSubmissions: 0, notes: '', tags: [] };
    const [form, setForm] = useState<Partial<Student>>(student ?? blank);
    const [saving, setSaving] = useState(false);

    const field = (label: string, key: keyof Student, type: string = 'text', extra?: object) => (
        <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#230603', marginBottom: 5 }}>{label}</label>
            <input type={type} value={(form[key] ?? '') as string} onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? parseFloat(e.target.value) : e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid rgba(35,6,3,0.12)', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' as const, color: '#230603' }} {...extra} />
        </div>
    );

    return (
        <>
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(35,6,3,0.25)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
            <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, backgroundColor: '#FAF3EC', zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(35,6,3,0.12)' }}>
                <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(35,6,3,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#230603', letterSpacing: '-0.5px' }}>{student ? 'Edit Student' : 'Add Student'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'rgba(35,6,3,0.4)' }}>×</button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {field('Full Name', 'name')}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {field('Student ID', 'studentId')}
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#230603', marginBottom: 5 }}>Grade</label>
                            <select value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid rgba(35,6,3,0.12)', fontSize: 14, fontFamily: 'inherit', backgroundColor: 'white', color: '#230603', cursor: 'pointer', outline: 'none', boxSizing: 'border-box' as const }}>
                                {['9', '10', '11', '12'].map(g => <option key={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>
                    {field('Subject / Class', 'subject')}
                    <div style={{ borderTop: '1px solid rgba(35,6,3,0.07)', paddingTop: 12 }}>
                        <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: 'rgba(35,6,3,0.4)' }}>Academic Indicators</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {field('Attendance %', 'attendanceRate', 'number', { min: 0, max: 100, step: 1 })}
                            {field('GPA (0.0–4.0)', 'gpa', 'number', { min: 0, max: 4, step: 0.1 })}
                            {field('Assignment Completion %', 'assignmentCompletion', 'number', { min: 0, max: 100, step: 1 })}
                            {field('Behavior Referrals', 'behaviorReferrals', 'number', { min: 0, step: 1 })}
                            {field('Late Submissions', 'lateSubmissions', 'number', { min: 0, step: 1 })}
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#230603', marginBottom: 5 }}>Teacher Notes</label>
                        <textarea value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid rgba(35,6,3,0.12)', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif', resize: 'vertical' as const, outline: 'none', backgroundColor: 'white', color: '#230603', boxSizing: 'border-box' as const }}
                            placeholder="Observations, context, flags..." />
                    </div>
                </div>
                <div style={{ padding: '16px 28px', borderTop: '1px solid rgba(35,6,3,0.07)', display: 'flex', gap: 10 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '11px', backgroundColor: 'white', border: '1px solid rgba(35,6,3,0.12)', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#230603', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                    <button disabled={saving || !form.name} onClick={async () => { setSaving(true); await onSave(form); setSaving(false); }}
                        style={{ flex: 1, padding: '11px', backgroundColor: '#800532', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
                        {saving ? 'Saving...' : student ? 'Save Changes' : 'Add Student'}
                    </button>
                </div>
            </div>
        </>
    );
}

// ─── CSV Import Modal ─────────────────────────────────────────────────────────
function CSVModal({ onClose, onImport }: { onClose: () => void; onImport: (rows: Partial<Student>[]) => Promise<void> }) {
    const [step, setStep] = useState<'choose' | 'paste'>('choose');
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [importing, setImporting] = useState(false);

    const parse = async () => {
        try {
            const lines = text.trim().split('\n').filter(Boolean);
            if (lines.length < 2) throw new Error('Need a header row plus at least one data row.');
            const parsed = lines.slice(1).map((line, i) => {
                const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
                if (!parts[0]) throw new Error(`Row ${i + 2}: Name is required`);
                return {
                    id: `csv-${Date.now()}-${i}`,
                    name: parts[0],
                    studentId: parts[1] || `ID-${Date.now()}-${i}`,
                    grade: parts[2] || '9',
                    gpa: parseFloat(parts[3]) || 3.0,
                    attendanceRate: parseFloat(parts[4]) || 90,
                    assignmentCompletion: 85,
                    behaviorReferrals: 0,
                    lateSubmissions: 0,
                    notes: parts[8] || '',
                    tags: [],
                };
            });
            setImporting(true);
            await onImport(parsed);
        } catch (e) { setError(String(e)); setImporting(false); }
    };

    return (
        <>
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(35,6,3,0.25)', zIndex: 200 }} />
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 520, backgroundColor: '#FAF3EC', zIndex: 201, borderRadius: 16, boxShadow: '0 20px 60px rgba(35,6,3,0.2)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(35,6,3,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#230603', letterSpacing: '-0.5px' }}>Import Students</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'rgba(35,6,3,0.4)' }}>×</button>
                </div>

                {step === 'choose' ? (
                    <div style={{ padding: '28px' }}>
                        <p style={{ fontSize: 14, color: 'rgba(35,6,3,0.6)', margin: '0 0 20px', lineHeight: 1.5 }}>
                            Use our CSV template to quickly add students. Only <strong>Name</strong>, <strong>Student ID</strong>, and <strong>Grade</strong> are required — all other fields are optional.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <a
                                href="/templates/students.csv"
                                download="rin-students-template.csv"
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    padding: '14px', backgroundColor: '#800532', color: 'white',
                                    borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none',
                                    transition: 'opacity 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                ↓ Download Template (.csv)
                            </a>
                            <button
                                onClick={() => setStep('paste')}
                                style={{
                                    padding: '14px', backgroundColor: 'white', color: '#230603',
                                    border: '1px solid rgba(35,6,3,0.12)', borderRadius: 10,
                                    fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                }}
                            >
                                I already have my CSV ready
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '20px 28px' }}>
                        <p style={{ fontSize: 12, color: 'rgba(35,6,3,0.45)', margin: '0 0 4px' }}>Required: Name, Student ID, Grade · Optional: GPA, Attendance%, Parent Name, Email, Phone, Notes</p>
                        <div style={{ backgroundColor: 'rgba(35,6,3,0.04)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'rgba(35,6,3,0.5)', fontFamily: 'monospace', marginBottom: 12 }}>Sarah Jenkins,STU-001,11,1.8,72,Robert Jenkins,r.jenkins@example.com,,Frequent absences</div>
                        <textarea value={text} onChange={e => { setText(e.target.value); setError(''); }} rows={8} placeholder="Paste CSV content here (including header row)..."
                            style={{ width: '100%', padding: '12px', borderRadius: 9, border: '1px solid rgba(35,6,3,0.12)', fontSize: 13, fontFamily: 'monospace', resize: 'vertical' as const, outline: 'none', backgroundColor: 'white', color: '#230603', boxSizing: 'border-box' as const }} />
                        {error && <p style={{ margin: '6px 0 0', fontSize: 13, color: '#C0392B' }}>{error}</p>}
                        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                            <button onClick={() => setStep('choose')} style={{ flex: 1, padding: '11px', backgroundColor: 'white', border: '1px solid rgba(35,6,3,0.12)', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#230603', cursor: 'pointer', fontFamily: 'inherit' }}>Back</button>
                            <button onClick={parse} disabled={importing || !text.trim()} style={{ flex: 1, padding: '11px', backgroundColor: '#800532', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'white', cursor: importing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: importing || !text.trim() ? 0.6 : 1 }}>
                                {importing ? 'Importing...' : 'Import Students'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
