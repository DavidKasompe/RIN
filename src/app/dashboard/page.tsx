'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, Button, CircularProgress } from '@/components/shared';
import DictateButton from '@/components/DictateButton';
import { saveAnalysis } from '@/lib/analysisStore';
import {
  getChatSession,
  saveChatSession,
  getActiveChatId,
  setActiveChatId,
  createNewChatId,
  extractChatTitle,
  type ChatMessage,
} from '@/lib/chatStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  riskData?: {
    riskScore: number;
    category: string;
    confidence: number;
    factors: string[];
  };
}

const suggestedPrompts = [
  {
    text: "Analyze a student whose attendance dropped below 75% and math scores declined this semester",
    icon: "/image-icon/vecteezy_leadership-for-successful-new-idea-excellent-business-graph_8879458.png"
  },
  {
    text: "Evaluate a student with high participation but consistently low assignment completion rates",
    icon: "/image-icon/vecteezy_3d-clipboard-icon-for-business-isolated-on-clean-background_47308238.png"
  },
  {
    text: "Assess risk for a student showing behavioral changes and declining engagement after winter break",
    icon: "/image-icon/vecteezy_minimalist-magnifying-glass-icon-with-blue-handle-3d-render_58144752.png"
  },
  {
    text: "Review a student with strong academics but frequent absences and late submissions",
    icon: "/image-icon/vecteezy_leadership-for-successful-new-idea-excellent-business-graph_8879458.png"
  }
];

// Track the latest analysis context for follow-up questions
interface AnalysisContext {
  summary: string;
  riskScore: number;
  factors: string[];
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisContext, setAnalysisContext] = useState<AnalysisContext | null>(null);
  const [chatId, setChatId] = useState<string>(() => getActiveChatId() || createNewChatId());

  // Save messages to chat session whenever they change
  useEffect(() => {
    if (messages.length === 0) return;
    const firstUserMsg = messages.find((m) => m.role === 'user');
    const title = firstUserMsg ? extractChatTitle(firstUserMsg.content) : 'New Analysis';
    const session = getChatSession(chatId);
    saveChatSession({
      id: chatId,
      title,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.getTime(),
        riskData: m.riskData,
      })),
      createdAt: session?.createdAt || Date.now(),
      updatedAt: Date.now(),
    });
    setActiveChatId(chatId);
  }, [messages, chatId]);

  // Listen for new-chat and load-chat events from sidebar
  const startNewChat = useCallback(() => {
    const newId = createNewChatId();
    setChatId(newId);
    setMessages([]);
    setHasStarted(false);
    setAnalysisContext(null);
    setActiveChatId(newId);
  }, []);

  const loadChat = useCallback((id: string) => {
    const session = getChatSession(id);
    if (!session) return;
    setChatId(session.id);
    setMessages(
      session.messages.map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }))
    );
    setHasStarted(session.messages.length > 0);
    setActiveChatId(session.id);
  }, []);

  useEffect(() => {
    const handleNew = () => startNewChat();
    const handleLoad = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      loadChat(detail);
    };
    window.addEventListener('rin-new-chat', handleNew);
    window.addEventListener('rin-load-chat', handleLoad);
    return () => {
      window.removeEventListener('rin-new-chat', handleNew);
      window.removeEventListener('rin-load-chat', handleLoad);
    };
  }, [startNewChat, loadChat]);

  // Load active chat on mount
  useEffect(() => {
    const activeId = getActiveChatId();
    if (activeId) {
      const session = getChatSession(activeId);
      if (session && session.messages.length > 0) {
        setChatId(session.id);
        setMessages(
          session.messages.map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        );
        setHasStarted(true);
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText && !selectedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: selectedFile 
        ? `${messageText}\n\n📎 Attached: ${selectedFile.name}` 
        : messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedFile(null);
    setHasStarted(true);
    setIsLoading(true);

    try {
      // Check if this is an intervention request
      const lowerText = messageText.toLowerCase();
      const isIntervention = lowerText.includes('intervention') || lowerText.includes('suggest') || 
        lowerText.includes('strategy') || lowerText.includes('action');

      if (isIntervention && analysisContext) {
        // Call intervention endpoint
        const res = await fetch('/api/intervention', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: analysisContext.summary,
            riskScore: analysisContext.riskScore,
          }),
        });
        const result = await res.json();
        const aiMessage = formatInterventionResponse(result.data);
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Call main analyze endpoint
        const conversationHistory = messages.map(m => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText,
            conversationHistory,
            analysisContext,
          }),
        });
        const result = await res.json();
        const aiMessage = formatAPIResponse(result);

        // Store analysis context for follow-ups
        if (result.type === 'analysis' && result.data?.risk) {
          setAnalysisContext({
            summary: result.data.summary,
            riskScore: result.data.risk.riskScore,
            factors: result.data.factors?.map((f: { name: string }) => f.name) || [],
          });

          // Persist to store for Overview page
          saveAnalysis({
            query: messageText,
            summary: result.data.summary,
            riskScore: result.data.risk.riskScore,
            category: result.data.risk.category,
            confidence: result.data.risk.confidence,
            factors: result.data.factors || [],
          });
        }

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('API error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an issue processing your request. Please try again with more details about the student.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format analysis API response into a chat message
  const formatAPIResponse = (result: { type: string; data: Record<string, unknown>; error?: string }): Message => {
    const { type, data } = result;

    if (type === 'analysis') {
      const d = data as { summary: string; risk: { riskScore: number; category: string; confidence: number }; factors: { name: string; impactPercentage: number; trend: string; description: string }[]; plainLanguage: string };
      const factorLines = d.factors
        .map((f, i) => `${i + 1}. **${f.name} — ${f.impactPercentage}% impact** ${f.trend === 'down' ? '↓' : f.trend === 'up' ? '↑' : '○'}\n   ${f.description}`)
        .join('\n\n');

      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `${d.plainLanguage}\n\n📊 **Contributing Factors (Ranked by Impact)**\n\n${factorLines}\n\n---\n\n💡 Would you like me to:\n• Explain the contributing factors in more detail?\n• Suggest intervention strategies?\n• Generate a parent-facing summary?\n• Simulate improvement scenarios?`,
        timestamp: new Date(),
        riskData: {
          riskScore: d.risk.riskScore,
          category: d.risk.category,
          confidence: d.risk.confidence,
          factors: d.factors.map(f => f.name),
        },
      };
    }

    if (type === 'scenario') {
      const d = data as { scenarios: { title: string; changes: string; predictedRiskScore: number; impact: number; likelihood: string }[]; keyInsight: string };
      const scenarioLines = d.scenarios
        .map((s, i) => `**Scenario ${i + 1}: ${s.title}**\n→ Predicted risk: **${s.predictedRiskScore}%** ${s.predictedRiskScore < 40 ? '✅' : '⚠️'}\n→ Impact: ${s.impact} points — *${s.changes}*`)
        .join('\n\n');

      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `🔮 **Improvement Scenario Simulation**\n\n---\n\n${scenarioLines}\n\n---\n\n📌 **Key Insight:** ${d.keyInsight}`,
        timestamp: new Date(),
      };
    }

    if (type === 'general') {
      const d = data as { response: string };
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: d.response,
        timestamp: new Date(),
      };
    }

    if (type === 'followup') {
      const d = data as { response: string; type: string };
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: d.response,
        timestamp: new Date(),
      };
    }

    // Fallback
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: String((data as { summary?: string; response?: string }).response || (data as { summary?: string }).summary || 'I can help you with that! Please try rephrasing your question.'),
      timestamp: new Date(),
    };
  };

  // Format intervention API response
  const formatInterventionResponse = (data: { interventions: { title: string; priority: string; description: string; actionSteps: string[]; expectedImpact: string }[]; parentSummary: string }): Message => {
    const grouped = {
      High: data.interventions.filter(i => i.priority === 'High'),
      Medium: data.interventions.filter(i => i.priority === 'Medium'),
      Low: data.interventions.filter(i => i.priority === 'Low'),
    };

    let content = 'Here are my recommended interventions, prioritized by expected impact:\n\n';

    if (grouped.High.length > 0) {
      content += '🔴 **High Priority**\n\n';
      grouped.High.forEach((iv, i) => {
        content += `**${i + 1}. ${iv.title}**\n`;
        iv.actionSteps.forEach(step => { content += `• ${step}\n`; });
        content += `*${iv.expectedImpact}*\n\n`;
      });
    }

    if (grouped.Medium.length > 0) {
      content += '🟡 **Medium Priority**\n\n';
      grouped.Medium.forEach((iv, i) => {
        content += `**${grouped.High.length + i + 1}. ${iv.title}**\n`;
        iv.actionSteps.forEach(step => { content += `• ${step}\n`; });
        content += `*${iv.expectedImpact}*\n\n`;
      });
    }

    if (grouped.Low.length > 0) {
      content += '🟢 **Low Priority**\n\n';
      grouped.Low.forEach((iv, i) => {
        content += `**${grouped.High.length + grouped.Medium.length + i + 1}. ${iv.title}**\n`;
        iv.actionSteps.forEach(step => { content += `• ${step}\n`; });
        content += `*${iv.expectedImpact}*\n\n`;
      });
    }

    content += `---\n\n📄 **Parent Summary:**\n${data.parentSummary}`;

    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] -mb-8 sm:-mb-12 -mx-3 sm:-mx-6 lg:-mx-8">
      {/* Main Content */}
      {!hasStarted ? (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 flex flex-col justify-center items-center px-2 pb-24 sm:pb-32">
            {/* Greeting */}
            <div className="text-center mb-6 sm:mb-10">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-1 sm:mb-2">
                Hi there, Educator 👋
              </h1>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold">
                <span style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #8B5CF6 50%, #3B82F6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  What would you like to know?
                </span>
              </h2>
            </div>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl mb-6 sm:mb-8">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(prompt.text)}
                  className="text-left p-3 sm:p-4 rounded-xl border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:shadow-md transition-all duration-200 group active:scale-[0.98]"
                >
                  <p className="text-xs sm:text-sm text-[var(--color-text)] leading-relaxed mb-2 sm:mb-3">
                    {prompt.text}
                  </p>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors overflow-hidden">
                    <img src={prompt.icon} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Conversation State — w-screen trick breaks out of max-w container so scrollbar is at viewport edge */
        <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar py-4 sm:py-8 pb-28 sm:pb-32 w-screen relative left-1/2 -translate-x-1/2">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="animate-fade-in">
                  {message.role === 'user' ? (
                    /* User Message */
                    <div className="flex justify-end">
                      <div className="max-w-[90%] sm:max-w-[85%] bg-[var(--color-primary)] text-white rounded-2xl rounded-br-md px-3 sm:px-5 py-2 sm:py-3">
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    /* AI Message */
                    <div className="flex gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-[8px] sm:text-[10px] font-bold">RIN</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-white border border-[var(--color-border)] rounded-2xl rounded-tl-md px-3 sm:px-5 py-3 sm:py-4 shadow-sm">
                          {/* Risk data card if present */}
                          {message.riskData && (
                            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 rounded-xl flex items-center gap-3 sm:gap-6">
                              <CircularProgress
                                value={message.riskData.riskScore}
                                size={60}
                                strokeWidth={6}
                                label="Risk"
                                animated
                              />
                              <div>
                                <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold mb-1 ${
                                  message.riskData.category === 'Critical Risk' ? 'bg-red-200 text-red-900' :
                                  message.riskData.category === 'At Risk' ? 'bg-red-100 text-red-700' :
                                  message.riskData.category === 'Moderate Risk' ? 'bg-amber-100 text-amber-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {message.riskData.category === 'Critical Risk' ? '🔴' :
                                   message.riskData.category === 'At Risk' ? '⚠️' :
                                   message.riskData.category === 'Moderate Risk' ? '🟡' :
                                   '✅'} {message.riskData.category}
                                </span>
                                <p className="text-xs sm:text-sm text-[var(--color-text-light)]">
                                  Confidence: {message.riskData.confidence}%
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="text-xs sm:text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: message.content
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\n/g, '<br/>')
                                .replace(/• /g, '&bull; ')
                            }}
                          />
                        </div>
                        
                        {/* Action buttons after AI assessment */}
                        {message.riskData && (
                          <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3 flex-wrap">
                            <Link href="/dashboard/overview">
                              <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium bg-[var(--color-primary)] text-white rounded-full hover:opacity-90 transition-opacity active:scale-95">
                                📊 Full Breakdown
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleSend("Suggest intervention strategies")}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium border border-[var(--color-border)] text-[var(--color-text)] rounded-full hover:bg-gray-50 transition-colors active:scale-95"
                            >
                              💡 Interventions
                            </button>
                            <button 
                              onClick={() => handleSend("Simulate improvement scenarios")}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium border border-[var(--color-border)] text-[var(--color-text)] rounded-full hover:bg-gray-50 transition-colors active:scale-95"
                            >
                              🔮 Scenarios
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-2 sm:gap-3 animate-fade-in">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[8px] sm:text-[10px] font-bold">RIN</span>
                  </div>
                  <div className="bg-white border border-[var(--color-border)] rounded-2xl rounded-tl-md px-4 sm:px-5 py-3 sm:py-4 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* Input Area - Fixed at bottom */}
      <div className="sticky bottom-0 w-full bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)] to-transparent pt-4 pb-3 sm:pt-6 sm:pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-lg hover:shadow-xl transition-shadow">
            {/* Selected file indicator */}
            {selectedFile && (
              <div className="px-4 pt-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                  <span>📎</span>
                  <span className="text-[var(--color-text)]">{selectedFile.name}</span>
                  <button 
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-end gap-1.5 sm:gap-2 p-2 sm:p-3">
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe a student's situation..."
                rows={1}
                className="flex-1 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm resize-none border-none outline-none bg-transparent text-[var(--color-text)] placeholder:text-gray-400"
                style={{ maxHeight: '120px' }}
              />

              {/* Action buttons */}
              <div className="flex items-center gap-1 sm:gap-2 pb-0.5 sm:pb-1">
                {/* Attach file button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".csv,.pdf,.xlsx,.txt"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 transition-all"
                  title="Attach file"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* Dictate button */}
                <DictateButton
                  onText={(text) => setInput(text)}
                  disabled={isLoading}
                />

                {/* Send button */}
                <button
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !selectedFile) || isLoading}
                  className="h-8 sm:h-9 px-3 sm:px-5 rounded-full bg-[var(--color-primary)] text-white text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="hidden sm:inline">Send</span>
                  <span className="sm:hidden">↑</span>
                </button>
              </div>
            </div>
          </div>

          <p className="text-[10px] sm:text-xs text-center text-gray-400 mt-2 sm:mt-3">
            RIN AI provides insights to support — not replace — your professional judgment.
          </p>
        </div>
      </div>
    </div>
  );
}
