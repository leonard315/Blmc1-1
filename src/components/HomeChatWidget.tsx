"use client";

import React, { useState, useRef, useEffect } from 'react';
import { memberAIAssistantWithContext, type AIMessage } from '@/ai/flows/member-ai-assistant';
import { Bot, X, Send, Loader2, MessageCircle } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; }

const QUICK_QUESTIONS = [
  'How do I become a member?',
  'What is the share capital requirement?',
  'What loans are available?',
  'What documents do I need?',
  'How do I deposit savings?',
  'What is a patronage refund?',
];

export function HomeChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm the BLMC AI Assistant. How can I help you today? Click a question below or ask me anything about the cooperative.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const history: AIMessage[] = messages.map(m => ({ role: m.role, content: m.content }));
      const reply = await memberAIAssistantWithContext({ message: userMsg, history });
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#e05c97] shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[340px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 bg-white"
          style={{ maxHeight: '520px' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-[#6c63ff] to-[#e05c97] px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-none">BLMC AI Assistant</p>
                <p className="text-white/70 text-[10px] mt-0.5">Always here to help</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ minHeight: 0 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#e05c97] flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#6c63ff] text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#e05c97] flex items-center justify-center shrink-0 mr-2 mt-0.5">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin text-[#6c63ff]" />
                  <span className="text-xs text-gray-400 italic">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 bg-white border-t border-gray-100 shrink-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick Questions</p>
              <div className="space-y-1 max-h-[120px] overflow-y-auto">
                {QUICK_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="w-full text-left text-xs text-[#6c63ff] hover:bg-[#6c63ff]/5 px-2 py-1.5 rounded-lg transition-colors border border-[#6c63ff]/20 hover:border-[#6c63ff]/40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-2.5 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
              placeholder="Ask a question..."
              disabled={loading}
              className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/30 focus:border-[#6c63ff] disabled:opacity-50"
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-full bg-[#6c63ff] flex items-center justify-center text-white hover:bg-[#5a52e0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Footer */}
          <div className="text-center py-1.5 bg-white border-t border-gray-50 shrink-0">
            <p className="text-[9px] text-gray-300">Powered by BLMC AI · v1.0</p>
          </div>
        </div>
      )}
    </>
  );
}
