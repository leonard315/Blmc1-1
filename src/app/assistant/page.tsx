"use client";

import React, { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Bot, User, MessageSquare, Sparkles, RefreshCw } from 'lucide-react';
import { memberAIAssistantWithContext, type AIMessage } from '@/ai/flows/member-ai-assistant';
import { ScrollArea } from '@/components/ui/scroll-area';

const QUICK_QUESTIONS = [
  'How do I become a member?',
  'What is the share capital requirement?',
  'What loans are available?',
  'How do I check my savings balance?',
  'What is a patronage refund?',
  'What documents do I need to apply?',
  'What feeds and supplies are available?',
  'How do I apply for a loan?',
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AssistantPage() {
  const { currentUser } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Magandang araw! 👋 I'm your **BLMC AI Assistant**. I'm here to help you with questions about the Bansud Livestock Multi-Purpose Cooperative — membership, loans, savings, feeds, and more.\n\nHow can I assist you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build history for context (exclude the initial greeting)
      const history: AIMessage[] = messages
        .slice(1)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await memberAIAssistantWithContext({
        message: text.trim(),
        history,
        memberName: currentUser?.name,
        memberSavings: currentUser?.savings,
        memberDebt: currentUser?.debt,
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again or contact the cooperative office directly.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([{
      role: 'assistant',
      content: `Magandang araw! 👋 I'm your **BLMC AI Assistant**. How can I assist you today?`,
      timestamp: new Date(),
    }]);
    setInput('');
  };

  // Simple markdown-like renderer
  const renderContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  const showQuickQuestions = messages.length <= 1;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#e05c97] flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              BLMC AI Assistant
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Powered by Gemini · Ask anything about the cooperative</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs gap-1.5 text-muted-foreground">
            <RefreshCw className="w-3.5 h-3.5" /> New Chat
          </Button>
        </div>

        {/* Chat card */}
        <Card className="flex-1 flex flex-col shadow-xl border overflow-hidden min-h-0">
          <CardHeader className="border-b px-4 py-3 shrink-0 bg-gradient-to-r from-[#6c63ff]/5 to-[#e05c97]/5">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4 text-[#6c63ff]" />
              Live Chat Support · BLMC Cooperative Assistant
            </CardTitle>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 p-0 overflow-hidden min-h-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        msg.role === 'assistant'
                          ? 'bg-gradient-to-br from-[#6c63ff] to-[#e05c97] text-white'
                          : 'bg-primary/10 text-primary border border-primary/20'
                      }`}>
                        {msg.role === 'assistant'
                          ? <Bot className="w-3.5 h-3.5" />
                          : <User className="w-3.5 h-3.5" />
                        }
                      </div>

                      {/* Bubble */}
                      <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-tr-sm'
                          : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                      }`}>
                        <div
                          dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
                          className="prose-sm max-w-none"
                        />
                        <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                          {msg.timestamp.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2.5 max-w-[85%]">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#e05c97] flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-[#6c63ff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-[#6c63ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-[#6c63ff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-gray-400 italic">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </CardContent>

          {/* Quick questions */}
          {showQuickQuestions && !isLoading && (
            <div className="px-4 py-3 border-t bg-gray-50/50 shrink-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Questions</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs text-[#6c63ff] bg-[#6c63ff]/5 hover:bg-[#6c63ff]/10 border border-[#6c63ff]/20 hover:border-[#6c63ff]/40 px-2.5 py-1 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <CardFooter className="p-3 border-t bg-white shrink-0">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                ref={inputRef}
                placeholder="Ask about membership, loans, savings, feeds..."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 h-11 rounded-full border-gray-200 focus-visible:ring-[#6c63ff]/30 focus-visible:border-[#6c63ff] px-5 text-sm"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="h-11 w-11 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#e05c97] hover:opacity-90 shadow-md shrink-0"
                disabled={isLoading || !input.trim()}
              >
                {isLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
