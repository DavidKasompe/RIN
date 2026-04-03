'use client';

import { useState, useEffect } from 'react';
import { Add, Trash, DocumentText, Calendar, Refresh } from 'iconsax-reactjs';
import { Loader2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Slot = { id: string; dayOfWeek: number; startTime: string; endTime: string; slotLabel: string | null };
type Entry = {
    id: string; slotId: string; subject: string; room: string | null; location: string | null;
    classType: string | null; roomCapacity: number | null; studentCount: number | null;
    cohortId: string | null; teacherId: string | null; recurring: boolean | null;
};
type EnrichedEntry = { entry: Entry; slot: Slot | null };

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const CLASS_TYPES = ['lecture', 'lab', 'tutorial', 'seminar', 'practical'];

const CLASS_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    lecture:   { bg: 'rgba(128,5,50,0.06)',   text: '#800532',  border: 'rgba(128,5,50,0.15)' },
    lab:       { bg: 'rgba(41,128,185,0.08)',  text: '#2980B9',  border: 'rgba(41,128,185,0.2)' },
    tutorial:  { bg: 'rgba(39,174,96,0.08)',   text: '#27AE60',  border: 'rgba(39,174,96,0.2)' },
    seminar:   { bg: 'rgba(155,89,182,0.08)',  text: '#9B59B6',  border: 'rgba(155,89,182,0.2)' },
    practical: { bg: 'rgba(230,126,34,0.08)',  text: '#E67E22',  border: 'rgba(230,126,34,0.2)' },
};

const DEFAULT_COLORS = { bg: 'rgba(35,6,3,0.04)', text: '#230603', border: 'rgba(35,6,3,0.1)' };

// ─── Add Entry Modal ──────────────────────────────────────────────────────────
function AddEntryModal({
    slots,
    onClose,
    onSave,
}: {
    slots: Slot[];
    onClose: () => void;
    onSave: (entry: Omit<Entry, 'id'>) => Promise<void>;
}) {
    const [slotId, setSlotId] = useState(slots[0]?.id ?? '');
    const [subject, setSubject] = useState('');
    const [room, setRoom] = useState('');
    const [classType, setClassType] = useState('');
    const [roomCapacity, setRoomCapacity] = useState('');
    const [studentCount, setStudentCount] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const inputStyle = {
        width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid rgb(228,221,205)',
        fontSize: 14, outline: 'none', fontFamily: 'inherit', backgroundColor: 'white',
        boxSizing: 'border-box' as const,
    };

    const handleSave = async () => {
        if (!slotId || !subject.trim()) { setError('Slot and subject are required.'); return; }
        setSaving(true);
        try {
            await onSave({
                slotId,
                subject,
                room: room || null,
                location: null,
                classType: classType || null,
                roomCapacity: roomCapacity ? parseInt(roomCapacity) : null,
                studentCount: studentCount ? parseInt(studentCount) : null,
                cohortId: null,
                teacherId: null,
                recurring: true,
            });
            onClose();
        } catch {
            setError('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 998, backdropFilter: 'blur(4px)' }} onClick={onClose} />
            <div style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                backgroundColor: 'white', borderRadius: 20, padding: 32, width: '90%', maxWidth: 520,
                zIndex: 999, boxShadow: '0 24px 48px -12px rgba(0,0,0,0.18)',
                fontFamily: "'Inter', system-ui, sans-serif",
            }}>
                <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#230603', letterSpacing: '-0.5px' }}>Add Class Session</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#230603', marginBottom: 6 }}>Time Slot *</label>
                        <select value={slotId} onChange={e => setSlotId(e.target.value)} style={inputStyle}>
                            {slots.map(s => (
                                <option key={s.id} value={s.id}>
                                    {DAYS[s.dayOfWeek]} {s.startTime}–{s.endTime}{s.slotLabel ? ` (${s.slotLabel})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#230603', marginBottom: 6 }}>Subject / Course *</label>
                        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Mathematics, CS101" style={inputStyle}
                            onFocus={e => e.currentTarget.style.borderColor = '#800532'}
                            onBlur={e => e.currentTarget.style.borderColor = 'rgb(228,221,205)'}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#230603', marginBottom: 6 }}>Room</label>
                            <input type="text" value={room} onChange={e => setRoom(e.target.value)} placeholder="e.g. LH-101" style={inputStyle}
                                onFocus={e => e.currentTarget.style.borderColor = '#800532'}
                                onBlur={e => e.currentTarget.style.borderColor = 'rgb(228,221,205)'}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#230603', marginBottom: 6 }}>Class Type</label>
                            <select value={classType} onChange={e => setClassType(e.target.value)} style={inputStyle}>
                                <option value="">None</option>
                                {CLASS_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#230603', marginBottom: 6 }}>Room Capacity</label>
                            <input type="number" value={roomCapacity} onChange={e => setRoomCapacity(e.target.value)} placeholder="e.g. 120" style={inputStyle}
                                onFocus={e => e.currentTarget.style.borderColor = '#800532'}
                                onBlur={e => e.currentTarget.style.borderColor = 'rgb(228,221,205)'}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#230603', marginBottom: 6 }}>Student Count</label>
                            <input type="number" value={studentCount} onChange={e => setStudentCount(e.target.value)} placeholder="e.g. 85" style={inputStyle}
                                onFocus={e => e.currentTarget.style.borderColor = '#800532'}
                                onBlur={e => e.currentTarget.style.borderColor = 'rgb(228,221,205)'}
                            />
                        </div>
                    </div>

                    {error && <div style={{ fontSize: 13, color: '#d32f2f', padding: '8px 12px', backgroundColor: 'rgba(211,47,47,0.06)', borderRadius: 8 }}>{error}</div>}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid rgb(228,221,205)', backgroundColor: 'white', fontSize: 14, fontWeight: 600, color: 'rgb(114,106,90)', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', backgroundColor: '#800532', fontSize: 14, fontWeight: 600, color: 'white', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.8 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Add Session'}
                    </button>
                </div>
            </div>
        </>
    );
}

// ─── Add Slot Modal ───────────────────────────────────────────────────────────
function AddSlotModal({ onClose, onSave }: { onClose: () => void; onSave: (slot: Omit<Slot, 'id'>) => Promise<void> }) {
    const [dayOfWeek, setDayOfWeek] = useState(0);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('09:00');
    const [slotLabel, setSlotLabel] = useState('');
    const [saving, setSaving] = useState(false);

    const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid rgb(228,221,205)', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const };

    const handleSave = async () => {
        setSaving(true);
        try { await onSave({ dayOfWeek, startTime, endTime, slotLabel: slotLabel || null }); onClose(); }
        finally { setSaving(false); }
    };

    return (
        <>
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 998, backdropFilter: 'blur(4px)' }} onClick={onClose} />
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', borderRadius: 20, padding: 32, width: '90%', maxWidth: 440, zIndex: 999, boxShadow: '0 24px 48px -12px rgba(0,0,0,0.18)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#230603', letterSpacing: '-0.5px' }}>Add Time Slot</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#230603', marginBottom: 6 }}>Day</label>
                        <select value={dayOfWeek} onChange={e => setDayOfWeek(Number(e.target.value))} style={inputStyle}>
                            {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#230603', marginBottom: 6 }}>Start</label>
                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#230603', marginBottom: 6 }}>End</label>
                            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={inputStyle} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#230603', marginBottom: 6 }}>Label (optional)</label>
                        <input type="text" value={slotLabel} onChange={e => setSlotLabel(e.target.value)} placeholder="e.g. Period 1, Morning Lecture" style={inputStyle}
                            onFocus={e => e.currentTarget.style.borderColor = '#800532'}
                            onBlur={e => e.currentTarget.style.borderColor = 'rgb(228,221,205)'}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid rgb(228,221,205)', backgroundColor: 'white', fontSize: 14, fontWeight: 600, color: 'rgb(114,106,90)', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', backgroundColor: '#800532', fontSize: 14, fontWeight: 600, color: 'white', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.8 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {saving ? <><Loader2 size={16} className="animate-spin" />Saving...</> : 'Add Slot'}
                    </button>
                </div>
            </div>
        </>
    );
}

// ─── Import Modal ─────────────────────────────────────────────────────────────
function ImportModal({ onClose, onImport }: { onClose: () => void; onImport: (text: string) => Promise<void> }) {
    const [text, setText] = useState('');
    const [importing, setImporting] = useState(false);

    const handleImport = async () => {
        if (!text.trim()) return;
        setImporting(true);
        try { await onImport(text); onClose(); }
        finally { setImporting(false); }
    };

    return (
        <>
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 998, backdropFilter: 'blur(4px)' }} onClick={onClose} />
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', borderRadius: 20, padding: 32, width: '90%', maxWidth: 560, zIndex: 999, boxShadow: '0 24px 48px -12px rgba(0,0,0,0.18)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#230603', letterSpacing: '-0.5px' }}>Import from Document</h2>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: 'rgb(114,106,90)', lineHeight: 1.5 }}>
                    Paste the raw timetable text below. The AI will parse it into structured class sessions automatically.
                </p>
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder={"e.g.\nMonday 8:00-9:00 Mathematics Room LH101 (Lecture, 120 seats)\nMonday 9:00-10:00 Physics Lab Room SC203 (Lab, 30 students)\nTuesday 10:00-11:00 CS101 Tutorial Room IT-05"}
                    style={{ width: '100%', minHeight: 180, padding: '12px', borderRadius: 10, border: '1px solid rgb(228,221,205)', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.currentTarget.style.borderColor = '#800532'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgb(228,221,205)'}
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid rgb(228,221,205)', backgroundColor: 'white', fontSize: 14, fontWeight: 600, color: 'rgb(114,106,90)', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleImport} disabled={importing || !text.trim()} style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', backgroundColor: '#800532', fontSize: 14, fontWeight: 600, color: 'white', cursor: (importing || !text.trim()) ? 'not-allowed' : 'pointer', opacity: (importing || !text.trim()) ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {importing ? <><Loader2 size={16} className="animate-spin" /> Parsing with AI...</> : 'Parse & Import'}
                    </button>
                </div>
            </div>
        </>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TimetablePage() {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [entries, setEntries] = useState<EnrichedEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const [showAddSlot, setShowAddSlot] = useState(false);
    const [showAddEntry, setShowAddEntry] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState('');

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [slotsRes, entriesRes] = await Promise.all([
                fetch('/api/timetable/slots').then(r => r.json()),
                fetch('/api/timetable/entries').then(r => r.json()),
            ]);
            setSlots(slotsRes.slots ?? []);
            setEntries(entriesRes.entries ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleAddSlot = async (slot: Omit<Slot, 'id'>) => {
        const res = await fetch('/api/timetable/slots', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slot),
        });
        const data = await res.json();
        if (data.slot) setSlots(prev => [...prev, data.slot]);
    };

    const handleAddEntry = async (entry: Omit<Entry, 'id'>) => {
        const res = await fetch('/api/timetable/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
        });
        const data = await res.json();
        if (data.entry) {
            const matchedSlot = slots.find(s => s.id === entry.slotId) ?? null;
            setEntries(prev => [...prev, { entry: data.entry, slot: matchedSlot }]);
        }
    };

    const handleDeleteEntry = async (entryId: string) => {
        setDeletingId(entryId);
        await fetch(`/api/timetable/entries/${entryId}`, { method: 'DELETE' });
        setEntries(prev => prev.filter(e => e.entry.id !== entryId));
        setDeletingId(null);
    };

    const handleImport = async (rawText: string) => {
        const res = await fetch('/api/timetable/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawScheduleText: rawText }),
        });
        const data = await res.json();
        if (!data.entries?.length) return;

        // For each parsed entry, create a slot if needed then create the entry
        let created = 0;
        for (const parsed of data.entries) {
            // 1. Create or reuse a matching slot
            let slot = slots.find(s =>
                s.dayOfWeek === parsed.dayOfWeek &&
                s.startTime === parsed.startTime &&
                s.endTime === parsed.endTime
            );

            if (!slot) {
                const slotRes = await fetch('/api/timetable/slots', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        dayOfWeek: parsed.dayOfWeek,
                        startTime: parsed.startTime,
                        endTime: parsed.endTime,
                        slotLabel: parsed.slotLabel ?? null,
                    }),
                });
                const slotData = await slotRes.json();
                slot = slotData.slot;
                if (slot) setSlots(prev => [...prev, slot!]);
            }

            if (!slot) continue;

            // 2. Create the entry
            const entryRes = await fetch('/api/timetable/entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slotId: slot.id,
                    subject: parsed.subject,
                    room: parsed.room ?? null,
                    classType: parsed.classType ?? null,
                    roomCapacity: parsed.roomCapacity ?? null,
                    studentCount: parsed.studentCount ?? null,
                    recurring: true,
                }),
            });
            const entryData = await entryRes.json();
            if (entryData.entry) {
                setEntries(prev => [...prev, { entry: entryData.entry, slot: slot! }]);
                created++;
            }
        }

        setImportSuccess(`Imported ${created} class session${created !== 1 ? 's' : ''} successfully.`);
        setTimeout(() => setImportSuccess(''), 4000);
    };

    // Build grid: days × sorted time slots
    const sortedSlots = [...slots].sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
        return a.startTime.localeCompare(b.startTime);
    });

    // Group entries by day then by slotId
    const entryMap: Record<number, Record<string, EnrichedEntry[]>> = {};
    for (let d = 0; d < 5; d++) entryMap[d] = {};
    for (const e of entries) {
        if (e.slot) {
            const day = e.slot.dayOfWeek;
            if (!entryMap[day][e.slot.id]) entryMap[day][e.slot.id] = [];
            entryMap[day][e.slot.id].push(e);
        }
    }

    // Unique time labels
    const timeLabels = Array.from(new Set(sortedSlots.map(s => `${s.startTime}–${s.endTime}`))).sort();

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", paddingBottom: 64 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: 'rgb(26,25,25)', margin: 0, letterSpacing: '-0.8px' }}>Timetable</h1>
                    <p style={{ fontSize: 15, color: 'rgb(114,106,90)', margin: '6px 0 0' }}>Manage class schedules, room assignments, and view availability</p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setShowImport(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', backgroundColor: 'white', border: '1px solid rgb(228,221,205)', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'rgb(26,25,25)', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(35,6,3,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                    >
                        <DocumentText size={16} color="rgb(114,106,90)" /> Import from Document
                    </button>
                    <button
                        onClick={() => setShowAddSlot(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', backgroundColor: 'white', border: '1px solid rgb(228,221,205)', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'rgb(26,25,25)', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(35,6,3,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                    >
                        <Calendar size={16} color="rgb(114,106,90)" /> Add Time Slot
                    </button>
                    <button
                        onClick={() => setShowAddEntry(true)}
                        disabled={slots.length === 0}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', backgroundColor: '#800532', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'white', cursor: slots.length === 0 ? 'not-allowed' : 'pointer', opacity: slots.length === 0 ? 0.6 : 1, transition: 'opacity 0.15s' }}
                    >
                        <Add size={16} color="white" /> Add Class
                    </button>
                </div>
            </div>

            {/* Import success banner */}
            {importSuccess && (
                <div style={{ padding: '12px 16px', backgroundColor: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.2)', borderRadius: 10, fontSize: 14, color: '#27AE60', fontWeight: 500, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    ✓ {importSuccess}
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 32, color: 'rgb(114,106,90)', fontSize: 14 }}>
                    <Loader2 size={18} className="animate-spin" /> Loading timetable...
                </div>
            ) : slots.length === 0 ? (
                /* Empty state */
                <div style={{ padding: '64px 32px', textAlign: 'center', backgroundColor: 'white', borderRadius: 16, border: '1px solid rgba(35,6,3,0.07)' }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>📅</div>
                    <h2 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 700, color: '#230603', letterSpacing: '-0.4px' }}>No timetable yet</h2>
                    <p style={{ margin: '0 0 28px', fontSize: 15, color: 'rgb(114,106,90)', lineHeight: 1.5, maxWidth: 380, marginInline: 'auto' }}>
                        Start by adding time slots (periods), then assign class sessions to them. Or import an existing schedule from a document.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => setShowImport(true)} style={{ padding: '12px 24px', backgroundColor: 'white', border: '1px solid rgb(228,221,205)', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'rgb(26,25,25)', cursor: 'pointer' }}>
                            Import from Document
                        </button>
                        <button onClick={() => setShowAddSlot(true)} style={{ padding: '12px 24px', backgroundColor: '#800532', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                            Add Time Slot
                        </button>
                    </div>
                </div>
            ) : (
                /* Weekly Grid */
                <div style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: 800 }}>
                        {/* Day headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: '100px repeat(5, 1fr)', gap: 1, marginBottom: 1 }}>
                            <div />
                            {DAYS.map(d => (
                                <div key={d} style={{ padding: '10px 14px', backgroundColor: 'white', borderRadius: 10, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#230603', border: '1px solid rgba(35,6,3,0.07)', letterSpacing: '-0.2px' }}>
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Time rows */}
                        {timeLabels.map(timeLabel => {
                            const [start, end] = timeLabel.split('–');
                            return (
                                <div key={timeLabel} style={{ display: 'grid', gridTemplateColumns: '100px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
                                    {/* Time label */}
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8px', gap: 2 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#230603' }}>{start}</span>
                                        <span style={{ fontSize: 11, color: 'rgb(114,106,90)' }}>{end}</span>
                                    </div>

                                    {/* Day cells */}
                                    {DAYS.map((_, dayIdx) => {
                                        const matchingSlots = slots.filter(s =>
                                            s.dayOfWeek === dayIdx &&
                                            s.startTime === start &&
                                            s.endTime === end
                                        );

                                        const cellEntries: EnrichedEntry[] = matchingSlots.flatMap(s => entryMap[dayIdx][s.id] ?? []);

                                        return (
                                            <div key={dayIdx} style={{ minHeight: 80, backgroundColor: 'white', borderRadius: 10, border: '1px solid rgba(35,6,3,0.06)', padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                {cellEntries.length === 0 ? (
                                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                                                        <span style={{ fontSize: 11, color: 'rgba(35,6,3,0.3)' }}>free</span>
                                                    </div>
                                                ) : (
                                                    cellEntries.map(({ entry }) => {
                                                        const colors = entry.classType ? (CLASS_TYPE_COLORS[entry.classType] ?? DEFAULT_COLORS) : DEFAULT_COLORS;
                                                        const isDeleting = deletingId === entry.id;
                                                        return (
                                                            <div key={entry.id} style={{ padding: '8px 10px', borderRadius: 8, backgroundColor: colors.bg, border: `1px solid ${colors.border}`, position: 'relative', opacity: isDeleting ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                                                                <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 2, lineHeight: 1.3 }}>{entry.subject}</div>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                                                                    {entry.room && <span style={{ fontSize: 11, color: 'rgba(35,6,3,0.5)', fontWeight: 500 }}>{entry.room}</span>}
                                                                    {entry.classType && <span style={{ fontSize: 10, fontWeight: 600, color: colors.text, backgroundColor: colors.bg, padding: '1px 5px', borderRadius: 4, border: `1px solid ${colors.border}`, textTransform: 'capitalize' }}>{entry.classType}</span>}
                                                                    {entry.studentCount && entry.roomCapacity && (
                                                                        <span style={{ fontSize: 10, color: entry.studentCount > entry.roomCapacity ? '#C0392B' : 'rgba(35,6,3,0.4)', fontWeight: 500 }}>
                                                                            {entry.studentCount}/{entry.roomCapacity}
                                                                            {entry.studentCount > entry.roomCapacity && ' ⚠'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleDeleteEntry(entry.id)}
                                                                    disabled={isDeleting}
                                                                    style={{ position: 'absolute', top: 4, right: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(35,6,3,0.25)', padding: 2, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                                                                    onMouseEnter={e => e.currentTarget.style.color = '#C0392B'}
                                                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(35,6,3,0.25)'}
                                                                >
                                                                    {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash size={12} />}
                                                                </button>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Legend */}
            {entries.length > 0 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
                    {Object.entries(CLASS_TYPE_COLORS).map(([type, colors]) => (
                        <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: colors.text }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: colors.text, textTransform: 'capitalize' }}>{type}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, backgroundColor: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#C0392B' }}>⚠ Over capacity</span>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showAddSlot && <AddSlotModal onClose={() => setShowAddSlot(false)} onSave={handleAddSlot} />}
            {showAddEntry && <AddEntryModal slots={slots} onClose={() => setShowAddEntry(false)} onSave={handleAddEntry} />}
            {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={handleImport} />}
        </div>
    );
}
