'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, isToday, addMonths, subMonths,
} from 'date-fns';
import { ArrowLeft2, ArrowRight2, Add } from 'iconsax-reactjs';

type CalendarEvent = {
    id: string; title: string; type: string; date: string;
    studentId?: string | null; notes?: string | null;
};

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    meeting: { bg: 'rgba(41,128,185,0.1)', text: '#1A5276', border: 'rgba(41,128,185,0.3)', dot: '#2980B9' },
    intervention: { bg: 'rgba(128,5,50,0.08)', text: '#800532', border: 'rgba(128,5,50,0.2)', dot: '#800532' },
    assessment: { bg: 'rgba(230,126,22,0.08)', text: '#784212', border: 'rgba(230,126,22,0.25)', dot: '#E67E22' },
    followup: { bg: 'rgba(39,174,96,0.08)', text: '#1D7A47', border: 'rgba(39,174,96,0.25)', dot: '#27AE60' },
};
const EVENT_TYPES = ['meeting', 'intervention', 'assessment', 'followup'];

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

    const fetchEvents = useCallback(async () => {
        const res = await fetch('/api/events');
        const data = await res.json();
        setEvents(data);
    }, []);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const daysInGrid = () => {
        const first = startOfMonth(currentMonth);
        const last = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start: first, end: last });
        const leading = getDay(first);
        const prefix: null[] = Array(leading).fill(null);
        return [...prefix, ...days];
    };

    const getEventsForDay = (day: Date) =>
        events.filter(e => isSameDay(new Date(e.date), day));

    const openCreateModal = (date: Date) => {
        setSelectedDate(date);
        setEditingEvent(null);
        setShowModal(true);
    };

    const openEditModal = (ev: CalendarEvent) => {
        setEditingEvent(ev);
        setSelectedDate(new Date(ev.date));
        setShowModal(true);
    };

    const deleteEvent = async (id: string) => {
        await fetch(`/api/events/${id}`, { method: 'DELETE' });
        setEvents(evs => evs.filter(e => e.id !== id));
    };

    const saveEvent = async (data: Partial<CalendarEvent>) => {
        if (editingEvent) {
            await fetch(`/api/events/${editingEvent.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        } else {
            await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        }
        setShowModal(false);
        await fetchEvents();
    };

    const upcoming = [...events]
        .filter(e => new Date(e.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 6);

    const grid = daysInGrid();

    return (
        <div style={{ fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', gap: 20, height: 'calc(100vh - 120px)' }}>
            {/* Main calendar */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Month header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#230603', margin: 0, letterSpacing: '-0.8px' }}>Calendar</h1>
                        <p style={{ fontSize: 14, color: 'rgba(35,6,3,0.45)', margin: '4px 0 0' }}>Schedule meetings, interventions, and follow-ups</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid rgba(35,6,3,0.1)', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowLeft2 size={16} color="#230603" />
                        </button>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#230603', minWidth: 160, textAlign: 'center' as const }}>{format(currentMonth, 'MMMM yyyy')}</span>
                        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid rgba(35,6,3,0.1)', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowRight2 size={16} color="#230603" />
                        </button>
                        <button onClick={() => openCreateModal(new Date())} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', backgroundColor: '#800532', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>
                            <Add size={16} color="white" /> Add Event
                        </button>
                    </div>
                </div>

                {/* Day-of-week labels */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 4 }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} style={{ textAlign: 'center' as const, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: 'rgba(35,6,3,0.35)', paddingBottom: 8 }}>{d}</div>
                    ))}
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, flex: 1 }}>
                    {grid.map((day, i) => {
                        if (!day) return <div key={`empty-${i}`} style={{ backgroundColor: 'rgba(35,6,3,0.02)', borderRadius: 8 }} />;
                        const dayEvents = getEventsForDay(day);
                        const today = isToday(day);
                        const inMonth = isSameMonth(day, currentMonth);
                        return (
                            <div key={format(day, 'yyyy-MM-dd')} onClick={() => openCreateModal(day)}
                                style={{ backgroundColor: today ? 'rgba(128,5,50,0.04)' : 'white', border: `1px solid ${today ? 'rgba(128,5,50,0.2)' : 'rgba(35,6,3,0.06)'}`, borderRadius: 10, padding: '8px 10px', cursor: 'pointer', minHeight: 80, display: 'flex', flexDirection: 'column', gap: 4, transition: 'background-color 0.1s' }}
                                onMouseEnter={e => { if (!today) (e.currentTarget.style.backgroundColor = 'rgba(250,243,236,0.7)'); }}
                                onMouseLeave={e => { if (!today) (e.currentTarget.style.backgroundColor = 'white'); }}>
                                <span style={{ fontSize: 13, fontWeight: today ? 800 : 500, color: today ? '#800532' : inMonth ? '#230603' : 'rgba(35,6,3,0.2)', lineHeight: 1 }}>{format(day, 'd')}</span>
                                {dayEvents.slice(0, 2).map(ev => {
                                    const col = EVENT_COLORS[ev.type] ?? EVENT_COLORS.meeting;
                                    return (
                                        <div key={ev.id} onClick={e => { e.stopPropagation(); openEditModal(ev); }}
                                            style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 5, backgroundColor: col.bg, color: col.text, border: `1px solid ${col.border}`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, lineHeight: 1.4 }}>
                                            {ev.title}
                                        </div>
                                    );
                                })}
                                {dayEvents.length > 2 && <span style={{ fontSize: 10, color: 'rgba(35,6,3,0.35)', fontWeight: 500 }}>+{dayEvents.length - 2} more</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar — upcoming events */}
            <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(35,6,3,0.35)', paddingTop: 52 }}>Upcoming Events</p>
                {upcoming.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'rgba(35,6,3,0.35)', fontStyle: 'italic' }}>No upcoming events.</p>
                ) : upcoming.map(ev => {
                    const col = EVENT_COLORS[ev.type] ?? EVENT_COLORS.meeting;
                    return (
                        <div key={ev.id} onClick={() => openEditModal(ev)} style={{ backgroundColor: 'white', borderRadius: 11, padding: '12px 14px', border: `1px solid ${col.border}`, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(35,6,3,0.08)')}
                            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.dot, flexShrink: 0 }} />
                                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: col.text }}>{ev.type}</span>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#230603', lineHeight: 1.4, marginBottom: 4 }}>{ev.title}</div>
                            <div style={{ fontSize: 11, color: 'rgba(35,6,3,0.4)' }}>{format(new Date(ev.date), 'EEE, MMM d')}</div>
                        </div>
                    );
                })}

                <div style={{ marginTop: 8, padding: '12px 0', borderTop: '1px solid rgba(35,6,3,0.08)' }}>
                    <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(35,6,3,0.35)' }}>Legend</p>
                    {EVENT_TYPES.map(t => {
                        const col = EVENT_COLORS[t];
                        return (
                            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: col.dot }} />
                                <span style={{ fontSize: 12, color: 'rgba(35,6,3,0.55)', textTransform: 'capitalize' as const }}>{t}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {showModal && (
                <EventModal
                    date={selectedDate!}
                    event={editingEvent}
                    onClose={() => { setShowModal(false); setEditingEvent(null); }}
                    onSave={saveEvent}
                    onDelete={editingEvent ? () => { deleteEvent(editingEvent.id); setShowModal(false); setEditingEvent(null); } : undefined}
                />
            )}
        </div>
    );
}

// ─── Event Modal ──────────────────────────────────────────────────────────────
function EventModal({ date, event, onClose, onSave, onDelete }: {
    date: Date; event: CalendarEvent | null;
    onClose: () => void; onSave: (d: Partial<CalendarEvent>) => Promise<void>;
    onDelete?: () => void;
}) {
    const [form, setForm] = useState({
        title: event?.title ?? '',
        type: event?.type ?? 'meeting',
        date: event ? format(new Date(event.date), 'yyyy-MM-dd') : format(date, 'yyyy-MM-dd'),
        notes: event?.notes ?? '',
    });
    const [saving, setSaving] = useState(false);

    return (
        <>
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(35,6,3,0.25)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 420, backgroundColor: '#FAF3EC', zIndex: 201, borderRadius: 16, boxShadow: '0 20px 60px rgba(35,6,3,0.2)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                <div style={{ padding: '22px 26px', borderBottom: '1px solid rgba(35,6,3,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#230603', letterSpacing: '-0.5px' }}>{event ? 'Edit Event' : 'New Event'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'rgba(35,6,3,0.4)' }}>×</button>
                </div>
                <div style={{ padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#230603', marginBottom: 5 }}>Title</label>
                        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Event title..."
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid rgba(35,6,3,0.12)', fontSize: 14, fontFamily: 'inherit', outline: 'none', backgroundColor: 'white', color: '#230603', boxSizing: 'border-box' as const }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#230603', marginBottom: 5 }}>Type</label>
                            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid rgba(35,6,3,0.12)', fontSize: 14, fontFamily: 'inherit', backgroundColor: 'white', color: '#230603', cursor: 'pointer', outline: 'none', boxSizing: 'border-box' as const }}>
                                {EVENT_TYPES.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#230603', marginBottom: 5 }}>Date</label>
                            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid rgba(35,6,3,0.12)', fontSize: 14, fontFamily: 'inherit', outline: 'none', backgroundColor: 'white', color: '#230603', boxSizing: 'border-box' as const }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#230603', marginBottom: 5 }}>Notes</label>
                        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Optional notes..."
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid rgba(35,6,3,0.12)', fontSize: 14, fontFamily: 'inherit', resize: 'vertical' as const, outline: 'none', backgroundColor: 'white', color: '#230603', boxSizing: 'border-box' as const }} />
                    </div>
                </div>
                <div style={{ padding: '14px 26px', borderTop: '1px solid rgba(35,6,3,0.07)', display: 'flex', gap: 8 }}>
                    {onDelete && <button onClick={onDelete} style={{ padding: '10px 16px', backgroundColor: 'rgba(192,57,43,0.08)', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, color: '#C0392B', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>}
                    <div style={{ flex: 1 }} />
                    <button onClick={onClose} style={{ padding: '10px 18px', backgroundColor: 'white', border: '1px solid rgba(35,6,3,0.12)', borderRadius: 9, fontSize: 13, fontWeight: 600, color: '#230603', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                    <button disabled={saving || !form.title} onClick={async () => { setSaving(true); await onSave({ ...form, date: form.date }); setSaving(false); }}
                        style={{ padding: '10px 20px', backgroundColor: '#800532', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving || !form.title ? 0.7 : 1 }}>
                        {saving ? 'Saving...' : event ? 'Save Changes' : 'Create Event'}
                    </button>
                </div>
            </div>
        </>
    );
}
