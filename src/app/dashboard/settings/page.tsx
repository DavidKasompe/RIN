'use client';

import { useState } from 'react';
import { Setting2, User, Export, Trash, InfoCircle } from 'iconsax-reactjs';

interface Profile {
  name: string;
  school: string;
  role: string;
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: 14, border: '0.67px solid rgb(228,221,205)', overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '16px 24px', borderBottom: '0.67px solid rgb(228,221,205)', display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon}
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'rgb(26,25,25)', letterSpacing: '-0.3px' }}>{title}</h3>
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  );
}

function FieldRow({ label, hint, last, children }: { label: string; hint?: string; last?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, alignItems: 'start', paddingBottom: last ? 0 : 16, marginBottom: last ? 0 : 16, borderBottom: last ? 'none' : '0.67px solid rgb(246,240,228)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgb(26,25,25)', marginBottom: 2 }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: 'rgb(114,106,90)' }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 9,
  border: '0.67px solid rgb(228,221,205)',
  fontSize: 14,
  fontFamily: "'DM Sans', system-ui, sans-serif",
  outline: 'none',
  backgroundColor: 'white',
  color: 'rgb(26,25,25)',
  boxSizing: 'border-box' as const,
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rin_profile');
      return stored ? JSON.parse(stored) : { name: '', school: '', role: 'educator' };
    }
    return { name: '', school: '', role: 'educator' };
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem('rin_profile', JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const exportData = () => {
    const data = {
      profile: JSON.parse(localStorage.getItem('rin_profile') ?? '{}'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rin-export.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const wipeData = () => {
    if (!confirm('This will clear all local profile data. Continue?')) return;
    localStorage.removeItem('rin_profile');
    window.location.reload();
  };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'rgb(26,25,25)', margin: 0, letterSpacing: '-0.8px' }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'rgb(114,106,90)', margin: '4px 0 0' }}>Manage your profile and application data</p>
      </div>

      {/* Profile */}
      <Section title="Profile" icon={<User size={16} color="#27AE60" variant="Bulk" />}>
        <FieldRow label="Full Name">
          <input value={profile.name} onChange={e => setProfile(s => ({ ...s, name: e.target.value }))} placeholder="Your name" style={inputStyle} />
        </FieldRow>
        <FieldRow label="School / Institution">
          <input value={profile.school} onChange={e => setProfile(s => ({ ...s, school: e.target.value }))} placeholder="e.g. Lincoln High School" style={inputStyle} />
        </FieldRow>
        <FieldRow label="Role" last>
          <select value={profile.role} onChange={e => setProfile(s => ({ ...s, role: e.target.value }))} style={inputStyle}>
            <option value="educator">Educator / Teacher</option>
            <option value="counselor">School Counselor</option>
            <option value="administrator">Administrator</option>
            <option value="advisor">Student Advisor</option>
          </select>
        </FieldRow>
      </Section>

      {/* Data Management */}
      <Section title="Data Management" icon={<Export size={16} color="#E67E22" variant="Bulk" />}>
        <FieldRow label="Export Profile" hint="Download a JSON backup of your settings">
          <button onClick={exportData} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', backgroundColor: 'rgba(230,126,22,0.08)', border: '0.67px solid rgba(230,126,22,0.2)', borderRadius: 9, fontSize: 13, fontWeight: 600, color: '#C87A0A', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Export size={15} color="#C87A0A" /> Export rin-export.json
          </button>
        </FieldRow>
        <FieldRow label="Clear Local Data" hint="Remove all locally stored profile data" last>
          <button onClick={wipeData} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', backgroundColor: 'rgba(192,57,43,0.08)', border: '0.67px solid rgba(192,57,43,0.15)', borderRadius: 9, fontSize: 13, fontWeight: 600, color: '#C0392B', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Trash size={15} color="#C0392B" /> Clear Local Data
          </button>
        </FieldRow>
      </Section>

      {/* About */}
      <Section title="About RIN" icon={<InfoCircle size={16} color="rgb(114,106,90)" />}>
        <div style={{ fontSize: 13, color: 'rgb(114,106,90)', lineHeight: 1.7 }}>
          <b style={{ color: 'rgb(26,25,25)' }}>Responsible Insight Navigator</b> — AI-powered early warning system for K-12 educators.<br />
          Version 1.0
        </div>
      </Section>

      {/* Save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={save} style={{ padding: '11px 28px', backgroundColor: '#800532', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px' }}>
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
