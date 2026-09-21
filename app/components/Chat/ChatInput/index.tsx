'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ArrowUp } from 'lucide-react';
import ReplyPreview from './ReplyPreview';
import { ReplyContext } from '../types';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (content: string, replyTo?: ReplyContext | null) => void;
  replyContext?: ReplyContext | null;
  onCancelReply?: () => void;
  disabled?: boolean;
}

export default function ChatInput({
  onSendMessage,
  replyContext,
  onCancelReply,
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed, replyContext);
    setText('');
    onCancelReply?.();

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className="flex flex-col bg-black/80 backdrop-blur-md border-t border-white/10 w-full shrink-0">
      {/* Reply Banner */}
      {replyContext && onCancelReply && (
        <ReplyPreview replyContext={replyContext} onCancel={onCancelReply} />
      )}

      {/* Main Input Row */}
      <div className="flex items-end gap-2 p-2.5 sm:px-4 sm:py-3">
        {/* Input Pill */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2 flex items-center min-h-[42px] focus-within:border-white/40 focus-within:bg-white/10 transition-colors">
          <textarea
            dir='auto'
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Write a message..."
            className="w-full bg-transparent text-sm text-white placeholder:text-muted-foreground focus:outline-none resize-none max-h-28 overflow-y-auto leading-relaxed"
          />
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'p-2.5 rounded-full shrink-0 transition-all duration-200 flex items-center justify-center mb-0.5',
            canSend
              ? 'bg-white text-black hover:bg-white/90 active:scale-95 shadow-md cursor-pointer'
              : 'bg-white/10 text-white/30 cursor-not-allowed',
          )}
          title="Send message"
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
