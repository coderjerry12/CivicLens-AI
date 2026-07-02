import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useAuth } from '@/features/auth';
import { cn } from '@/lib/utils';

const CITIZEN_SUGGESTIONS = [
  'How many issues have I reported?',
  'What categories can I report?',
  'How to track my issue?',
  'What is my community impact?',
];

const AUTHORITY_SUGGESTIONS = [
  'How many issues are pending?',
  'Show resolution statistics',
  'Which department has most issues?',
  'What are critical priority issues?',
];

export function FloatingAssistant() {
  const { messages, isOpen, isTyping, sendMessage, toggle, close } = useAIAssistant();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const suggestions = user?.role === 'authority' ? AUTHORITY_SUGGESTIONS : CITIZEN_SUGGESTIONS;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    sendMessage(msg);
    setInput('');
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-[100] w-[340px] sm:w-[380px] rounded-[20px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-2xl animate-scale-in overflow-hidden flex flex-col" style={{ height: '520px' }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/20 border-2 border-primary-200 dark:border-primary-500/30">
                <Sparkles className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success-500 border-2 border-white dark:border-neutral-900" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">CivicLens Assistant</h3>
              <p className="text-[11px] text-success-600 dark:text-success-400">Online • Gemini Connected</p>
            </div>
            <button onClick={close} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
              <X className="h-4 w-4 text-neutral-500" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50 dark:bg-neutral-950/30">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/20 mr-2 mt-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                  </div>
                )}
                <div className={cn(
                  'max-w-[75%] rounded-[16px] px-3.5 py-2.5 text-[13px] leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 shadow-sm rounded-bl-sm'
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/20 mr-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-[16px] rounded-bl-sm px-4 py-3 shadow-sm">
                  <span className="inline-flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && !isTyping && (
            <div className="px-3 py-2 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion)}
                    className="shrink-0 text-[11px] px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:border-primary-300 dark:hover:border-primary-500/30 hover:text-primary-700 dark:hover:text-primary-400 transition-all whitespace-nowrap"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSend()}
                placeholder="Ask CivicLens AI..."
                className="flex-1 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-text-primary dark:text-neutral-200 px-4 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-40 transition-all shadow-md shadow-primary-600/20"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <div className="fixed bottom-4 right-4 z-[100] group">
        {/* Hover tooltip */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
            <div className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg animate-bounce">
              💬 Click to Chat!
            </div>
          </div>
        )}
        <button
          onClick={toggle}
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all duration-300',
            isOpen
              ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
              : 'bg-white dark:bg-neutral-800 hover:scale-110 shadow-xl border-[3px] border-primary-500'
          )}
          aria-label="AI Assistant"
        >
          {isOpen ? <X className="h-6 w-6" /> : (
            <div className="relative">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="10" width="16" height="16" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" transform="rotate(0 16 18)" />
                <ellipse cx="16" cy="10" rx="8" ry="3" fill="#1e293b" />
                <circle cx="16" cy="8" r="2" fill="#f59e0b" />
                <circle cx="12" cy="18" r="2.5" fill="#2563eb" />
                <circle cx="20" cy="18" r="2.5" fill="#2563eb" />
                <polygon points="16,21 14,24 18,24" fill="#f59e0b" />
              </svg>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success-500 border-2 border-white dark:border-neutral-800 animate-pulse" />
            </div>
          )}
        </button>
      </div>
    </>
  );
}
