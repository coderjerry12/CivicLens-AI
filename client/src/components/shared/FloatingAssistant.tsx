import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { cn } from '@/lib/utils';

export function FloatingAssistant() {
  const { messages, isOpen, isTyping, sendMessage, toggle, close } = useAIAssistant();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-[100] w-80 sm:w-96 rounded-[20px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-2xl animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary-600 dark:bg-primary-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">CivicLens AI</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Gemini</span>
            </div>
            <button onClick={close} className="hover:bg-white/20 rounded-full p-1 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-[80%] rounded-[14px] px-3 py-2 text-xs leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-[14px] px-3 py-2 text-xs text-neutral-500">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-neutral-200 dark:border-neutral-700 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 h-9 rounded-[10px] border border-border dark:border-neutral-700 bg-surface dark:bg-neutral-800 text-text-primary dark:text-neutral-200 px-3 text-xs placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-50 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={toggle}
        className="fixed bottom-4 right-4 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 hover:bg-primary-500 hover:scale-105 transition-all duration-200"
        aria-label="AI Assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
