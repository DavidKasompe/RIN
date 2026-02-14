/**
 * Chat Store — persists chat sessions (message threads) to localStorage
 * so users can start new analyses and revisit old ones from the sidebar.
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  riskData?: {
    riskScore: number;
    category: string;
    confidence: number;
    factors: string[];
  };
}

export interface ChatSession {
  id: string;
  title: string;         // Short label derived from first user message
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'rin_chat_sessions';
const ACTIVE_KEY = 'rin_active_chat';

/* ── CRUD ── */

export function getChatSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getChatSession(id: string): ChatSession | null {
  return getChatSessions().find((s) => s.id === id) || null;
}

export function saveChatSession(session: ChatSession): void {
  const sessions = getChatSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }
  // Keep max 30 sessions
  const trimmed = sessions.slice(0, 30);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function deleteChatSession(id: string): void {
  const sessions = getChatSessions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function clearAllChatSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ACTIVE_KEY);
}

/* ── Active chat tracking ── */

export function getActiveChatId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveChatId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

/* ── Helpers ── */

export function createNewChatId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function extractChatTitle(firstUserMessage: string): string {
  // Try to extract a meaningful name
  const cleaned = firstUserMessage.replace(/\n/g, ' ').trim();
  if (cleaned.length <= 40) return cleaned;
  // Cut at word boundary
  const cut = cleaned.slice(0, 40);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut) + '…';
}
