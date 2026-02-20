'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { C1Component, ThemeProvider } from '@thesysai/genui-sdk';
import { ArrowUp, AlertTriangle, Brain, FileText, TrendingUp, Loader2, Search, Paperclip, Sliders } from 'lucide-react';
import { Icon } from '@iconify/react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
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
  onChunk: (acc: string) => void,
  signal: AbortSignal,
) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
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
function AssistantBubble({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  return (
    <div style={{ display: 'flex', marginBottom: '20px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <C1Component
          c1Response={content}
          isStreaming={isStreaming}
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
  onSend: (text: string) => void;
  isLoading: boolean;
  hasMessages?: boolean;
}

function InputBox({ value, onChange, onSend, isLoading, hasMessages = false }: InputBoxProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const filtered = value.trim().length > 0
    ? SUGGESTIONS.filter(s => s.toLowerCase().includes(value.toLowerCase()))
    : [];

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
    setShowSuggestions(!hasMessages && e.target.value.trim().length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSend = () => {
    if (!value.trim() || isLoading) return;
    setShowSuggestions(false);
    onSend(value);
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

            {/* Textarea */}
            <textarea
              ref={taRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => !hasMessages && value.trim() && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 160)}
              placeholder="Ask RIN about a student… (Shift+Enter for new line)"
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

            {/* Toolbar */}
            <div style={{
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              borderTop: '1px solid rgba(228,221,205,0.5)',
            }}>
              {/* Left: attach + tools */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  className="rin-toolbar-btn"
                  title="Attach file"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', height: '34px', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'rgb(114,106,90)', gap: '6px', fontSize: '14px', fontFamily: "'DM Sans', system-ui, sans-serif" }}
                >
                  <Paperclip size={15} />
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
                      {[
                        { icon: () => <img src="https://www.gstatic.com/classroom/logo_square_rounded.svg" width={14} height={14} alt="Classroom" />, label: 'Google Classroom' },
                        { icon: () => <div style={{ width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src="https://www.powerschool.com/wp-content/themes/powerschool/img/logo-cyan-p.svg" width={14} height={14} alt="PowerSchool" /></div>, label: 'PowerSchool SIS' },
                        { icon: () => <Icon icon="devicon:moodle" width="14" height="14" />, label: 'Moodle LMS' },
                        { icon: () => <Icon icon="logos:google-calendar" width="14" height="14" />, label: 'Google Calendar' },
                        { icon: () => <Icon icon="ri:notion-fill" width="14" height="14" color="#230603" />, label: 'Notion Base' },
                      ].map(t => (
                        <button key={t.label} className="rin-tool-item" onClick={() => setToolsOpen(false)} style={{
                          display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                          padding: '9px 12px', background: 'transparent', border: 'none',
                          borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                          fontSize: '14px', fontWeight: 500, color: 'rgb(26,25,25)',
                          fontFamily: "'DM Sans', system-ui, sans-serif",
                          transition: 'background 0.1s',
                        }}>
                          <t.icon />
                          <span>{t.label}</span>
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (userText: string) => {
    const text = userText.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text };
    const asstId = crypto.randomUUID();
    const asstMsg: Message = { id: asstId, role: 'assistant', content: '', isStreaming: true };

    setMessages(prev => [...prev, userMsg, asstMsg]);
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      await streamC1(history, (acc) => {
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
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0;

  return (
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
                <InputBox value={input} onChange={setInput} onSend={sendMessage} isLoading={isLoading} hasMessages={false} />
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
                  : <AssistantBubble key={m.id} content={m.content} isStreaming={m.isStreaming ?? false} />
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── Sticky footer input (active thread) ── */}
        {!isEmpty && (
          <div style={{ padding: '10px 24px 20px', background: 'rgb(250,250,249)' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
              <InputBox value={input} onChange={setInput} onSend={sendMessage} isLoading={isLoading} hasMessages={true} />
              <p style={{ fontSize: '11px', color: 'rgb(160,155,145)', textAlign: 'center', marginTop: '8px' }}>
                RIN supports your judgment — always verify with school records.
              </p>
            </div>
          </div>
        )}

      </div>
    </ThemeProvider>
  );
}
