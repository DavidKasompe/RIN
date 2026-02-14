'use client';

import { useState, useEffect } from 'react';
import { clearAnalyses, getAnalyses } from '@/lib/analysisStore';

export default function SettingsPage() {
  const [name, setName] = useState('Educator');
  const [email, setEmail] = useState('');
  const [mounted, setMounted] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [cleared, setCleared] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved profile
    const savedName = localStorage.getItem('rin_profile_name');
    const savedEmail = localStorage.getItem('rin_profile_email');
    if (savedName) setName(savedName);
    if (savedEmail) setEmail(savedEmail);
    setAnalysisCount(getAnalyses().length);
  }, []);

  const handleSave = () => {
    localStorage.setItem('rin_profile_name', name);
    localStorage.setItem('rin_profile_email', email);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all analysis history? This cannot be undone.')) {
      clearAnalyses();
      setAnalysisCount(0);
      setCleared(true);
      setTimeout(() => setCleared(false), 2000);
    }
  };

  const handleExport = () => {
    const analyses = getAnalyses();
    const blob = new Blob([JSON.stringify(analyses, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rin-analyses-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!mounted) return null;

  return (
    <div style={{ maxWidth: '680px' }}>
      <h1
        style={{
          fontFamily: "Georgia, 'Times New Roman', Times, serif",
          fontWeight: 400,
          fontSize: '36px',
          color: '#292929',
          margin: '0 0 8px',
        }}
      >
        Settings
      </h1>
      <p style={{ fontSize: '15px', color: '#72726e', margin: '0 0 40px' }}>
        Manage your profile and preferences.
      </p>

      {/* ── Profile ── */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#292929', margin: '0 0 20px' }}>
          Profile
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#72726e', marginBottom: '6px' }}>
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '15px',
                borderRadius: '10px',
                border: '1px solid #e8e8e5',
                outline: 'none',
                color: '#292929',
                background: '#fff',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={(e) => (e.target.style.borderColor = '#e8e8e5')}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#72726e', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="educator@school.edu"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '15px',
                borderRadius: '10px',
                border: '1px solid #e8e8e5',
                outline: 'none',
                color: '#292929',
                background: '#fff',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={(e) => (e.target.style.borderColor = '#e8e8e5')}
            />
          </div>
          <div>
            <button
              onClick={handleSave}
              style={{
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '10px',
                border: 'none',
                background: 'var(--color-primary)',
                color: '#fff',
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
            >
              {saved ? '✓ Saved!' : 'Save Profile'}
            </button>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: '1px', background: '#f0f0ee', marginBottom: '40px' }} />

      {/* ── Data Management ── */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#292929', margin: '0 0 8px' }}>
          Data Management
        </h2>
        <p style={{ fontSize: '14px', color: '#72726e', margin: '0 0 20px' }}>
          You have <strong style={{ color: '#292929' }}>{analysisCount}</strong> saved {analysisCount === 1 ? 'analysis' : 'analyses'}.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExport}
            disabled={analysisCount === 0}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '10px',
              border: '1px solid #e8e8e5',
              background: '#fff',
              color: analysisCount === 0 ? '#c0c0bc' : '#292929',
              cursor: analysisCount === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export as JSON
          </button>

          <button
            onClick={handleClear}
            disabled={analysisCount === 0}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '10px',
              border: '1px solid #fecaca',
              background: analysisCount === 0 ? '#fafafa' : '#fff5f5',
              color: analysisCount === 0 ? '#c0c0bc' : '#dc2626',
              cursor: analysisCount === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
            {cleared ? '✓ Cleared!' : 'Clear All Data'}
          </button>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: '1px', background: '#f0f0ee', marginBottom: '40px' }} />

      {/* ── About ── */}
      <section>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#292929', margin: '0 0 16px' }}>
          About RIN
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f4' }}>
            <span style={{ fontSize: '14px', color: '#72726e' }}>Version</span>
            <span style={{ fontSize: '14px', color: '#292929', fontWeight: 500 }}>1.0.0</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f4' }}>
            <span style={{ fontSize: '14px', color: '#72726e' }}>Model</span>
            <span style={{ fontSize: '14px', color: '#292929', fontWeight: 500 }}>Grok AI</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ fontSize: '14px', color: '#72726e' }}>Built With</span>
            <span style={{ fontSize: '14px', color: '#292929', fontWeight: 500 }}>Next.js + TypeScript</span>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: '#b0b0ac', marginTop: '24px' }}>
          RIN AI provides insights to support — not replace — your professional judgment.
        </p>
      </section>
    </div>
  );
}
