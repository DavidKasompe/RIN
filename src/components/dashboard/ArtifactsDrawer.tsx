'use client';

import { useState, useEffect, useCallback } from 'react';
import { DocumentText, PresentionChart, ArrowDown2, CloseCircle } from 'iconsax-reactjs';

type Artifact = {
  id: string;
  title: string;
  type: 'pdf' | 'pptx';
  publicUrl: string;
  createdAt: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ArtifactCard({ item }: { item: Artifact }) {
  const isPdf = item.type === 'pdf';
  const accent = isPdf ? '#800532' : '#2563EB';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px',
      borderRadius: 12,
      border: '1px solid rgba(35,6,3,0.07)',
      backgroundColor: 'white',
      transition: 'box-shadow 0.15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(35,6,3,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        backgroundColor: `${accent}12`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isPdf
          ? <DocumentText size={20} color={accent} variant="Bulk" />
          : <PresentionChart size={20} color={accent} variant="Bulk" />}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#230603', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(35,6,3,0.45)' }}>
          {formatDate(item.createdAt)} · {isPdf ? 'PDF Report' : 'Presentation'}
        </p>
      </div>

      {/* Open button */}
      <a
        href={item.publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 14px',
          borderRadius: 8,
          backgroundColor: `${accent}10`,
          color: accent,
          fontSize: 12, fontWeight: 600,
          textDecoration: 'none',
          flexShrink: 0,
          transition: 'background-color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${accent}20`)}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = `${accent}10`)}
      >
        <ArrowDown2 size={13} color={accent} />
        Open
      </a>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'rgba(35,6,3,0.4)' }}>
      <DocumentText size={36} color="rgba(35,6,3,0.2)" variant="Bulk" style={{ margin: '0 auto 12px' }} />
      <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>No {label} yet</p>
      <p style={{ margin: '6px 0 0', fontSize: 12 }}>
        Ask RIN to create one in the chat — try &quot;Generate a risk report for [student name]&quot;
      </p>
    </div>
  );
}

export default function ArtifactsDrawer() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'reports' | 'slides'>('reports');
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchArtifacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/artifacts');
      if (res.ok) {
        const data = await res.json() as { artifacts: Artifact[] };
        setArtifacts(data.artifacts ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch artifacts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when drawer opens
  useEffect(() => {
    if (open) fetchArtifacts();
  }, [open, fetchArtifacts]);

  const reports = artifacts.filter(a => a.type === 'pdf');
  const slides  = artifacts.filter(a => a.type === 'pptx');
  const list    = activeTab === 'reports' ? reports : slides;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 18px',
          borderRadius: 10,
          border: '1px solid rgba(35,6,3,0.1)',
          backgroundColor: 'white',
          color: '#230603',
          fontSize: 13, fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'Inter, system-ui, sans-serif',
          transition: 'background-color 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = 'rgba(128,5,50,0.04)';
          e.currentTarget.style.borderColor = 'rgba(128,5,50,0.25)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.borderColor = 'rgba(35,6,3,0.1)';
        }}
      >
        <DocumentText size={16} color="#800532" variant="Bulk" />
        Saved Reports &amp; Slides
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 1000,
            animation: 'fadeIn 0.15s ease',
          }}
        />
      )}

      {/* Drawer panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 520,
        backgroundColor: 'rgb(250,249,247)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        zIndex: 1001,
        display: 'flex', flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(35,6,3,0.08)',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#230603', letterSpacing: '-0.4px' }}>
              Saved Reports &amp; Slides
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(35,6,3,0.45)' }}>
              {artifacts.length} artifact{artifacts.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(35,6,3,0.4)' }}
          >
            <CloseCircle size={22} color="rgba(35,6,3,0.4)" variant="Bulk" />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 6, padding: '14px 24px',
          borderBottom: '1px solid rgba(35,6,3,0.06)',
          flexShrink: 0,
        }}>
          {(['reports', 'slides'] as const).map(tab => {
            const isActive = activeTab === tab;
            const count = tab === 'reports' ? reports.length : slides.length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  transition: 'background-color 0.15s, color 0.15s',
                  backgroundColor: isActive ? '#800532' : 'transparent',
                  color: isActive ? 'white' : 'rgba(35,6,3,0.55)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {tab === 'reports' ? 'Reports' : 'Slides'} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(35,6,3,0.35)', fontSize: 13 }}>
              Loading…
            </div>
          ) : list.length === 0 ? (
            <EmptyState label={activeTab === 'reports' ? 'reports' : 'slide decks'} />
          ) : (
            list.map(item => <ArtifactCard key={item.id} item={item} />)
          )}
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </>
  );
}
