'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

import { ThemeProvider, C1Component } from '@thesysai/genui-sdk';
import { ArrowUp, AlertTriangle, Brain, FileText, TrendingUp, Loader2, Search, Paperclip, Sliders, X } from 'lucide-react';
import { Icon } from '@iconify/react';
import { useGlobalContextStore } from '@/lib/contextStore';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  type?: 'system'; // used for injected guide messages — renders as plain text, not via C1Component
}

// ─── RIN theme ────────────────────────────────────────────────────────────────
const RIN_THEME = {
  theme: {
    backgroundFills: 'rgb(250,250,249)',
    containerFills: 'white',
    elevatedFills: 'white',
    strokeDefault: 'rgb(228,221,205)',
    strokeInteractiveEl: 'rgb(228,221,205)',
    chatContainerBg: 'rgb(250,250,249)',
    chatUserResponseBg: '#800532',
    chatUserResponseText: 'white',
    chatAssistantResponseBg: 'white',
    chatAssistantResponseText: 'rgb(26,25,25)',
    brandElFills: '#800532',
    brandElHoverFills: '#6b0428',
    primaryText: 'rgb(26,25,25)',
    secondaryText: 'rgb(114,106,90)',
    interactiveAccent: '#800532',
    interactiveAccentHover: '#6b0428',
  },
};


// ─── Starter chips ────────────────────────────────────────────────────────────
const STARTERS = [
  { icon: AlertTriangle, label: 'Analyze student risk', color: '#dc2626', prompt: 'Analyze dropout risk for a student with 68% attendance, GPA 1.8, and 4 behavior referrals this semester.' },
  { icon: Brain, label: 'Intervention plan', color: '#800532', prompt: 'Suggest evidence-based intervention strategies for a student with chronic absenteeism and declining grades.' },
  { icon: FileText, label: 'Parent letter', color: '#92400e', prompt: 'Write a parent-facing summary letter about a student showing academic decline and attendance issues.' },
  { icon: TrendingUp, label: 'Scenario simulation', color: '#065f46', prompt: 'Simulate risk trajectory if a student improves attendance by 15% and completes all assignments next term.' },
];

// ─── Typing suggestions ───────────────────────────────────────────────────────
const SUGGESTIONS = [
  'Analyze dropout risk for a student with low attendance',
  'What interventions work best for at-risk students?',
  'Generate an intervention plan for a struggling student',
  'Write a parent letter about academic concerns',
  'Simulate improvement if attendance increases by 20%',
  'What factors contribute most to student dropout?',
  'How can I support a student with behavioral issues?',
];

// ─── Stream helper ────────────────────────────────────────────────────────────
async function streamC1(
  messages: { role: string; content: string }[],
  currentViewContext: any,
  activeToolkits: string[],
  onChunk: (acc: string) => void,
  signal: AbortSignal,
) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, currentViewContext, activeToolkits }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`Stream failed: ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    accumulated += decoder.decode(value, { stream: true });
    onChunk(accumulated);
  }
}

// ─── User bubble ─────────────────────────────────────────────────────────────
function UserBubble({ content }: { content: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
      <div style={{
        maxWidth: '72%',
        padding: '11px 15px',
        borderRadius: '18px',
        background: '#800532',
        color: 'white',
        fontSize: '14px',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {content}
      </div>
    </div>
  );
}

// ─── Assistant bubble ─────────────────────────────────────────────────────────
// onAction: routes C1 button/form clicks into the next chat turn
// exportAsPdf / exportAsPPTX: triggered by C1 artifact download buttons
async function handleExportPdf(args: any) {
  try {
    const exportParams = args?.exportParams || args?.artifactId || '';
    const title = args?.title || args?.artifactId || 'rin-report';
    
    const res = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exportParams, title }),
    });
    if (!res.ok) { console.error('PDF export failed'); return; }
    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      // Persisted to Supabase — open the public URL
      const { publicUrl } = await res.json() as { publicUrl: string };
      if (publicUrl) window.open(publicUrl, '_blank');
    } else {
      // Fallback: direct buffer download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\.pdf$/i, '')}.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    }
  } catch (err) {
    console.error('PDF export error:', err);
  }
}

async function handleExportPptx(args: any) {
  try {
    const exportParams = args?.exportParams || args?.artifactId || '';
    const title = args?.title || args?.artifactId || 'rin-slides';

    const res = await fetch('/api/export-pptx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exportParams, title }),
    });
    if (!res.ok) { console.error('PPTX export failed'); return; }
    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      // Persisted to Supabase — open the public URL
      const { publicUrl } = await res.json() as { publicUrl: string };
      if (publicUrl) window.open(publicUrl, '_blank');
    } else {
      // Fallback: direct buffer download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\.pptx$/i, '')}.pptx`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    }
  } catch (err) {
    console.error('PPTX export error:', err);
  }
}

function AssistantBubble({ content, isStreaming, onAction }: {
  content: string;
  isStreaming: boolean;
  onAction: (event: any) => void;
}) {
  // Guard: C1Component crashes if content is undefined or empty (can happen mid-export re-render)
  if (!content) return null;
  return (
    <div style={{ display: 'flex', marginBottom: '20px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <C1Component
          c1Response={content}
          isStreaming={isStreaming}
          onAction={onAction}
          enableArtifactEdit={true}
          exportAsPdf={handleExportPdf}
          exportAsPPTX={handleExportPptx}
          onError={({ code }) => console.error('C1 error', code)}
        />
      </div>
    </div>
  );
}

// ─── Input Box ────────────────────────────────────────────────────────────────
interface InputBoxProps {
  value: string;
  onChange: (v: string) => void;
  onSend: (text: string, apiText?: string) => void;
  isLoading: boolean;
  hasMessages?: boolean;
  connectedToolkits: any[];
  selectedToolkits: string[];
  onToggleToolkit: (slug: string) => void;
}

type AttachedDoc = { filename: string; text: string };

function InputBox({ value, onChange, onSend, isLoading, hasMessages = false, connectedToolkits, selectedToolkits, onToggleToolkit }: InputBoxProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [attachedDoc, setAttachedDoc] = useState<AttachedDoc | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Mention autocomplete state
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [mentionState, setMentionState] = useState<{ active: boolean; query: string; startIndex: number; selectedIndex: number } | null>(null);

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(data => setStudents(data)).catch(() => { });
  }, []);

  const filtered = value.trim().length > 0
    ? SUGGESTIONS.filter(s => s.toLowerCase().includes(value.toLowerCase()))
    : [];

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';

    const cursor = ta.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const lastAtMatch = /(?:^|\s)@([^\s]*)$/.exec(textBeforeCursor);

    if (lastAtMatch) {
      setMentionState({
        active: true,
        query: lastAtMatch[1],
        startIndex: textBeforeCursor.lastIndexOf('@'),
        selectedIndex: 0,
      });
      setShowSuggestions(false);
    } else {
      setMentionState(null);
      setShowSuggestions(!hasMessages && val.trim().length > 0);
    }
  };

  const handleMentionSelect = (name: string) => {
    if (!mentionState) return;
    const before = value.slice(0, mentionState.startIndex);
    const after = value.slice(mentionState.startIndex + mentionState.query.length + 1);
    const newValue = `${before}@${name} ${after}`;
    onChange(newValue);
    setMentionState(null);
    setTimeout(() => taRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionState?.active) {
      const filteredStudents = students.filter(s => s.name.toLowerCase().includes(mentionState.query.toLowerCase()));
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionState({ ...mentionState, selectedIndex: Math.min(mentionState.selectedIndex + 1, filteredStudents.length - 1) });
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionState({ ...mentionState, selectedIndex: Math.max(mentionState.selectedIndex - 1, 0) });
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filteredStudents[mentionState.selectedIndex]) {
          handleMentionSelect(filteredStudents[mentionState.selectedIndex].name);
        }
        return;
      }
      if (e.key === 'Escape') {
        setMentionState(null);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey && !mentionState?.active) { e.preventDefault(); handleSend(); }
  };

  const handleSend = () => {
    if (!value.trim() || isLoading) return;
    setShowSuggestions(false);
    if (attachedDoc) {
      // Build LLM-friendly message with document context injected
      const displayName = attachedDoc.filename.length > 30
        ? attachedDoc.filename.slice(0, 27) + '…'
        : attachedDoc.filename;
      const apiText = `[ATTACHED DOCUMENT: "${attachedDoc.filename}"]
${attachedDoc.text}
[END DOCUMENT]

${value}`;
      const displayText = `📎 ${displayName}\n\n${value}`;
      setAttachedDoc(null);
      setUploadError(null);
      onSend(displayText, apiText);
    } else {
      onSend(value);
    }
  };

  const handleSuggestionClick = (s: string) => {
    onChange(s);
    setShowSuggestions(false);
    onSend(s);
  };

  const hasInput = value.trim().length > 0;

  return (
    <div style={{ width: '100%', position: 'relative' }}>

      {/* ── Glass input card ── */}
      <div className="rin-glass-input">

        {/* Beige background layer */}
        <div style={{
          background: 'rgb(243,240,236)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          transition: 'all 0.5s cubic-bezier(0,0,0.2,1)',
        }}>

          {/* White inner card */}
          <div style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '18px',
            border: '2px solid rgba(255,255,255,0.7)',
            boxShadow: '0 8px 32px rgba(114,106,90,0.12), 0 2px 8px rgba(114,106,90,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
            overflow: 'visible',
            position: 'relative',
          }}>

            {/* ─ Mention Popover ─ */}
            {mentionState?.active && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: '20px',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(228,221,205,0.8)',
                boxShadow: '0 8px 30px rgba(114,106,90,0.15)',
                width: '280px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 100,
                padding: '6px',
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}>
                {students.filter(s => s.name.toLowerCase().includes(mentionState.query.toLowerCase())).length === 0 ? (
                  <div style={{ padding: '8px 12px', fontSize: '13px', color: 'rgba(114,106,90,0.8)' }}>No students found</div>
                ) : (
                  students.filter(s => s.name.toLowerCase().includes(mentionState.query.toLowerCase())).map((student, i) => (
                    <div
                      key={student.id}
                      onClick={() => handleMentionSelect(student.name)}
                      style={{
                        padding: '8px 12px',
                        fontSize: '14px',
                        color: 'rgb(26,25,25)',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        background: i === mentionState.selectedIndex ? 'rgba(128,5,50,0.08)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={() => setMentionState({ ...mentionState, selectedIndex: i })}
                    >
                      <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'rgba(128,5,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#800532' }}>
                        {student.name.charAt(0)}
                      </div>
                      {student.name}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ─ Attachment chip ─ */}
            {attachedDoc && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                margin: '4px 18px 0',
                padding: '5px 10px',
                backgroundColor: 'rgba(128,5,50,0.07)',
                borderRadius: 8,
                border: '1px solid rgba(128,5,50,0.15)',
                maxWidth: 'fit-content',
              }}>
                <FileText size={13} color="#800532" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#800532', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {attachedDoc.filename.length > 28 ? attachedDoc.filename.slice(0, 25) + '…' : attachedDoc.filename}
                </span>
                <button
                  onClick={() => { setAttachedDoc(null); setUploadError(null); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#800532', opacity: 0.6 }}
                >
                  <X size={12} />
                </button>
              </div>
            )}
            {uploadError && (
              <p style={{ margin: '4px 18px 0', fontSize: 12, color: '#C0392B' }}>{uploadError}</p>
            )}

            {/* Textarea */}
            <textarea
              ref={taRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => !hasMessages && value.trim() && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 160)}
              placeholder="Ask about a student… (Shift+Enter for new line)"
              rows={1}
              style={{
                fontSize: '16px',
                lineHeight: '22px',
                padding: '18px 18px 10px',
                minHeight: '80px',
                maxHeight: '200px',
                width: '100%',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                resize: 'none',
                overflowY: 'hidden',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                color: 'rgb(26,25,25)',
                boxSizing: 'border-box',
                borderRadius: '18px 18px 0 0',
              }}
            />

            {/* Selected tool chips — show as compact pills above toolbar */}
            {selectedToolkits.length > 0 && (
              <div style={{
                padding: '4px 14px 6px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
              }}>
                {connectedToolkits
                  .filter(t => selectedToolkits.includes(t.slug))
                  .map(t => (
                    <button
                      key={t.slug}
                      onClick={() => onToggleToolkit(t.slug)}
                      className="rin-tool-chip"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '4px 8px 4px 6px',
                        background: 'rgba(5,128,80,0.07)',
                        border: '1px solid rgba(5,128,80,0.18)',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '12px', fontWeight: 500, color: '#058050',
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                        lineHeight: '1',
                        transition: 'all 0.15s',
                      }}
                    >
                      {t.icon
                        ? <img src={t.icon} width={13} height={13} style={{ flexShrink: 0, objectFit: 'contain', borderRadius: 3 }} alt={t.name} />
                        : <span style={{ fontSize: 11 }}>⚡</span>
                      }
                      <span>{t.name}</span>
                      <span style={{ marginLeft: '2px', fontSize: '11px', opacity: 0.7, lineHeight: 1 }}>×</span>
                    </button>
                  ))
                }
              </div>
            )}

            {/* Toolbar */}
            <div style={{
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              borderTop: '1px solid rgba(228,221,205,0.5)',
            }}>
              {/* Left: hidden file input + attach button + tools */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    // Reset so same file can be re-selected
                    e.target.value = '';
                    setUploading(true);
                    setUploadError(null);
                    setAttachedDoc(null);
                    try {
                      const fd = new FormData();
                      fd.append('file', file);
                      const res = await fetch('/api/upload-document', { method: 'POST', body: fd });
                      const data = await res.json();
                      if (!res.ok) {
                        setUploadError(data.error ?? 'Could not read this file. Try a different format.');
                      } else {
                        setAttachedDoc({ filename: data.filename, text: data.text });
                      }
                    } catch {
                      setUploadError('Upload failed. Please try again.');
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
                <button
                  className="rin-toolbar-btn"
                  title="Attach file (PDF, DOCX, TXT)"
                  disabled={uploading || isLoading}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', height: '34px', background: attachedDoc ? 'rgba(128,5,50,0.08)' : 'transparent', border: attachedDoc ? '1px solid rgba(128,5,50,0.2)' : '1px solid transparent', borderRadius: '8px', cursor: uploading || isLoading ? 'not-allowed' : 'pointer', color: attachedDoc ? '#800532' : 'rgb(114,106,90)', gap: '6px', fontSize: '14px', fontFamily: "'DM Sans', system-ui, sans-serif", opacity: uploading ? 0.5 : 1, transition: 'all 0.15s' }}
                >
                  {uploading
                    ? <Loader2 size={15} style={{ animation: 'rin-spin 1s linear infinite' }} />
                    : <Paperclip size={15} />}
                </button>

                <div style={{ position: 'relative' }}>
                  <button
                    className="rin-toolbar-btn"
                    onClick={() => setToolsOpen(o => !o)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', height: '34px',
                      background: toolsOpen ? 'rgb(243,240,236)' : 'transparent',
                      border: 'none', borderRadius: '8px', cursor: 'pointer',
                      color: toolsOpen ? 'rgb(26,25,25)' : 'rgb(114,106,90)',
                      fontSize: '14px', fontWeight: 500, fontFamily: "'DM Sans', system-ui, sans-serif",
                      transition: 'all 0.15s',
                    }}
                  >
                    <Sliders size={14} />
                    <span>Tools</span>
                  </button>

                  {/* Tools dropdown */}
                  {toolsOpen && (
                    <div style={{
                      position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, zIndex: 50,
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid rgba(228,221,205,0.8)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      padding: '6px',
                      minWidth: '200px',
                      animation: 'rin-dropdown-up 0.18s cubic-bezier(0.16,1,0.3,1) both',
                    }}>
                      {connectedToolkits.length === 0 ? (
                        <div style={{ padding: '8px 12px', fontSize: 13, color: 'rgb(114,106,90)', textAlign: 'center' }}>No tools connected yet.<br /><a href="/dashboard/integrations" style={{ color: '#800532', fontWeight: 600 }}>Manage tools</a></div>
                      ) : connectedToolkits.map(t => (
                        <button key={t.slug} className="rin-tool-item" onClick={(e) => { e.stopPropagation(); onToggleToolkit(t.slug); }} style={{
                          display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                          padding: '9px 12px', background: selectedToolkits.includes(t.slug) ? 'rgba(5,128,80,0.06)' : 'transparent', border: selectedToolkits.includes(t.slug) ? '1px solid rgba(5,128,80,0.15)' : '1px solid transparent',
                          borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                          fontSize: '14px', fontWeight: 500, color: 'rgb(26,25,25)',
                          fontFamily: "'DM Sans', system-ui, sans-serif",
                          transition: 'background 0.1s', marginBottom: '4px'
                        }}>
                          {t.icon ? <img src={t.icon} width={16} height={16} style={{ flexShrink: 0, objectFit: 'contain' }} alt={t.name} /> : <div style={{ width: 16, height: 16 }}>⚡</div>}
                          <span style={{ flex: 1 }}>{t.name}</span>
                          {selectedToolkits.includes(t.slug) && <Icon icon="lucide:check" width="16" color="#058050" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: send */}
              <button
                className="rin-send-btn"
                onClick={handleSend}
                disabled={!hasInput || isLoading}
                style={{
                  width: '34px', height: '34px',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: hasInput && !isLoading ? '#1a1918' : '#1a1918',
                  opacity: hasInput && !isLoading ? 1 : 0.45,
                  color: 'white',
                  border: 'none',
                  borderRadius: '9999px',
                  cursor: hasInput && !isLoading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {isLoading
                  ? <Loader2 size={14} style={{ animation: 'rin-spin 1s linear infinite' }} />
                  : <ArrowUp size={15} strokeWidth={2.5} />
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Suggestions dropdown BELOW the input ── */}
      {showSuggestions && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(228,221,205,0.8)',
          borderRadius: '14px',
          boxShadow: '0 8px 24px rgba(114,106,90,0.10)',
          overflow: 'hidden',
          animation: 'rin-dropdown-down 0.18s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          {filtered.slice(0, 7).map((s, i) => (
            <button
              key={i}
              onMouseDown={() => handleSuggestionClick(s)}
              className="rin-suggestion-item"
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '11px 16px',
                background: 'transparent', border: 'none',
                borderBottom: i < Math.min(filtered.length, 7) - 1 ? '0.666px solid rgba(228,221,205,0.4)' : 'none',
                cursor: 'pointer', textAlign: 'left',
                fontSize: '14px', color: 'rgb(26,25,25)',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                transition: 'background 0.1s',
              }}
            >
              <Search size={14} color="rgb(160,155,145)" style={{ flexShrink: 0 }} />
              <span>{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const currentViewContext = useGlobalContextStore((state) => state.currentViewContext);
  const pendingPrompt = useGlobalContextStore((state) => state.pendingPrompt);
  const setPendingPrompt = useGlobalContextStore((state) => state.setPendingPrompt);

  const hasHandledPendingPrompt = useRef(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [connectedToolkits, setConnectedToolkits] = useState<any[]>([]);
  const [selectedToolkits, setSelectedToolkits] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Mount guard & fetch toolkits
  useEffect(() => {
    setIsMounted(true);

    async function fetchToolkits() {
      try {
        const res = await fetch('/api/integrations');
        const data = await res.json();
        if (data.available && data.items) {
          const connected = data.items.filter((t: any) => t.isConnected);
          setConnectedToolkits(connected);
        }
      } catch (err) {
        console.error("Failed to load toolkits", err);
      }
    }
    fetchToolkits();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (displayText: string, apiText?: string) => {
    const text = displayText.trim();
    const prompt = (apiText ?? displayText).trim();
    if (!prompt || isLoading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text };
    const asstId = crypto.randomUUID();
    const asstMsg: Message = { id: asstId, role: 'assistant', content: '', isStreaming: true };

    setMessages(prev => [...prev, userMsg, asstMsg]);
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    // Use prompt (llmFriendlyMessage on action clicks, or same as displayText for manual input)
    // to build the history so the LLM gets full context, while the chat shows displayText.
    const history = [...messages, { role: 'user' as const, content: prompt }];

    try {
      await streamC1(history, currentViewContext, selectedToolkits, (acc) => {
        setMessages(prev => prev.map(m => m.id === asstId ? { ...m, content: acc } : m));
      }, controller.signal);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setMessages(prev => prev.map(m => m.id === asstId ? { ...m, content: 'Sorry, something went wrong. Please try again.' } : m));
      }
    } finally {
      setMessages(prev => prev.map(m => m.id === asstId ? { ...m, isStreaming: false } : m));
      setIsLoading(false);
    }
  }, [messages, isLoading, currentViewContext, selectedToolkits]);

  // Process pending deep-link prompts
  useEffect(() => {
    if (isMounted && pendingPrompt && !isLoading && messages.length === 0 && !hasHandledPendingPrompt.current) {
      hasHandledPendingPrompt.current = true;
      setInput(pendingPrompt);

      const timer = setTimeout(() => {
        // We use the direct current value from the closure/state. 
        // If the user manually edited the input during the delay, we don't send it automatically.
        // To safely check the latest input without a stale closure or impure setState, 
        // we can just send it automatically since this is an intended deep link flow.
        sendMessage(pendingPrompt);
        setInput('');
        setPendingPrompt(null);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isMounted, pendingPrompt, isLoading, messages.length, setPendingPrompt, sendMessage]);

  const handleToggleToolkit = useCallback((slug: string) => {
    setSelectedToolkits(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  }, []);

  // Handle interactive C1 UI actions (button clicks, form submits inside C1 components).
  // humanFriendlyMessage is shown in the chat bubble; llmFriendlyMessage is sent to the LLM.
  const handleC1Action = useCallback((event: any) => {
    // Log the event in dev so we can inspect its shape
    if (process.env.NODE_ENV === 'development') {
      console.log('[C1 Action event]', JSON.stringify(event, null, 2));
    }

    if (event.type === 'open_url' && event.params?.url) {
      window.open(event.params.url, '_blank', 'noopener,noreferrer');
      return;
    }

    const allText = (
      (event.params?.llmFriendlyMessage ?? '') +
      ' ' + (event.params?.humanFriendlyMessage ?? '') +
      ' ' + (event.type ?? '')
    ).toLowerCase();

    // Detect slide/PPTX export intent from action text
    const isSlideAction = allText.includes('pptx') || allText.includes('slide') ||
                          allText.includes('presentation') || allText.includes('powerpoint');

    // If the event carries exportParams, route directly to the export handler
    if (event.params?.exportParams && isSlideAction) {
      handleExportPptx(event.params);
      return;
    }
    if (event.params?.exportParams && (allText.includes('pdf') || allText.includes('report'))) {
      handleExportPdf(event.params);
      return;
    }

    // If it's a slide download action WITHOUT exportParams (AI-generated action button),
    // intercept it and inject a guide message with type='system' so it renders as a plain
    // info box (not through C1Component which expects JSON DSL).
    if (isSlideAction) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        type: 'system' as const,
        content: '📥 Your slide deck is ready! To save it to "Saved Reports & Slides", click the ⬇ download icon in the top-right corner of the slide viewer panel above, then choose "Download as PPTX". The file will download and automatically be saved to your drawer.',
        isStreaming: false,
      }]);
      return;
    }

    const { llmFriendlyMessage, humanFriendlyMessage } = event.params ?? {};
    if (llmFriendlyMessage) {
      // Display the short human label in chat; send the full context payload to the API
      sendMessage(humanFriendlyMessage || llmFriendlyMessage, llmFriendlyMessage);
    }
  }, [sendMessage, setMessages]);

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Render ThemeProvider only on client to avoid SSR/client hydration UID mismatch */}
      {isMounted && (
        <ThemeProvider {...RIN_THEME}>
          <style>{`
        @keyframes rin-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @keyframes rin-dropdown-down {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes rin-dropdown-up {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }

        .rin-glass-input {
          filter: drop-shadow(0 4px 20px rgba(114,106,90,0.08));
          transition: filter 0.25s;
        }
        .rin-glass-input:focus-within {
          filter: drop-shadow(0 6px 28px rgba(128,5,50,0.07));
        }

        .rin-toolbar-btn:hover { background: rgb(243,240,236) !important; color: rgb(26,25,25) !important; }
        .rin-tool-item:hover { background: rgb(243,240,236) !important; }
        .rin-suggestion-item:hover { background: rgb(250,250,249) !important; }
        .rin-send-btn:hover:not(:disabled) { background: #800532 !important; transform: scale(1.05); }

        .rin-tool-chip:hover {
          background: rgba(220,38,38,0.07) !important;
          border-color: rgba(220,38,38,0.2) !important;
          color: #dc2626 !important;
        }

        .rin-chip {
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        .rin-chip:hover {
          background: white !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important;
        }

        .rin-chat-scroll::-webkit-scrollbar { width: 4px; }
        .rin-chat-scroll::-webkit-scrollbar-thumb { background: rgba(114,106,90,0.25); border-radius: 9999px; }
      `}</style>

          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgb(250,250,249)' }}>

            {/* ── Messages or Welcome ── */}
            <div className="rin-chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: isEmpty ? '0' : '24px 24px 0' }}>
              {isEmpty ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px 80px' }}>

                  {/* Heading */}
                  <h1 style={{
                    fontSize: '36px', fontWeight: 400, color: 'rgb(26,25,25)',
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    margin: '0 0 28px', textAlign: 'center', lineHeight: '1.1',
                  }}>
                    What can I help with today?
                  </h1>

                  {/* Input */}
                  <div style={{ maxWidth: '760px', width: '100%', position: 'relative' }}>
                    <InputBox value={input} onChange={setInput} onSend={sendMessage} isLoading={isLoading} hasMessages={false} connectedToolkits={connectedToolkits} selectedToolkits={selectedToolkits} onToggleToolkit={handleToggleToolkit} />
                  </div>

                  {/* Chips */}
                  <div style={{
                    maxWidth: '760px', width: '100%', marginTop: '14px',
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px',
                  }}>
                    {STARTERS.map(s => (
                      <button
                        key={s.label}
                        className="rin-chip"
                        onClick={() => sendMessage(s.prompt)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                          padding: '9px 12px',
                          background: 'rgba(255,255,255,0.8)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: '0.666px solid rgb(228,221,205)',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          fontSize: '13px', fontWeight: 500, color: 'rgb(26,25,25)',
                          fontFamily: "'DM Sans', system-ui, sans-serif",
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <s.icon size={14} color={s.color} />
                        </span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '16px' }}>
                  {messages.map(m =>
                    m.role === 'user'
                      ? <UserBubble key={m.id} content={m.content} />
                      : m.type === 'system'
                        ? (
                          <div key={m.id} style={{
                            display: 'flex', marginBottom: '20px',
                          }}>
                            <div style={{
                              flex: 1, minWidth: 0,
                              background: 'rgba(128,5,50,0.05)',
                              border: '1px solid rgba(128,5,50,0.15)',
                              borderRadius: 12,
                              padding: '12px 16px',
                              fontSize: 13,
                              color: 'rgb(26,25,25)',
                              lineHeight: 1.6,
                              fontFamily: "'DM Sans', system-ui, sans-serif",
                            }}>
                              {m.content}
                            </div>
                          </div>
                        )
                        : <AssistantBubble key={m.id} content={m.content} isStreaming={m.isStreaming ?? false} onAction={handleC1Action} />
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* ── Sticky footer input (active thread) ── */}
            {!isEmpty && (
              <div style={{ padding: '10px 24px 20px', background: 'rgb(250,250,249)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
                  <InputBox value={input} onChange={setInput} onSend={sendMessage} isLoading={isLoading} hasMessages={true} connectedToolkits={connectedToolkits} selectedToolkits={selectedToolkits} onToggleToolkit={handleToggleToolkit} />
                  <p style={{ fontSize: '11px', color: 'rgb(160,155,145)', textAlign: 'center', marginTop: '8px' }}>
                    RIN supports your judgment — always verify with school records.
                  </p>
                </div>
              </div>
            )}

          </div>
        </ThemeProvider>
      )}
    </>
  );
}
