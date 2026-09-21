'use client';

import { Check, CheckCheck, Reply, Clock, AlertCircle } from 'lucide-react';
import { ChatMessage, ReplyContext } from '../types';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  isSender: boolean;
  onReply?: (context: ReplyContext) => void;
  onRetry?: (message: ChatMessage) => void;
}

function formatMessageTime(dateInput: string | Date): string {
  const date = new Date(dateInput);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function MessageBubble({ message, isSender, onReply, onRetry }: MessageBubbleProps) {
  const { content, replyTo, isRead, isEdited, createdAt, status } = message;

  return (
    <div
      className={cn(
        'group relative flex flex-col max-w-[85%] sm:max-w-[75%] my-1 text-[14.5px] leading-relaxed select-text transition-all',
        isSender ? 'self-end items-end' : 'self-start items-start',
      )}
    >
      {/* Telegram Floating Quick-Reply Action Button on hover */}
      {onReply && (
        <button
          type="button"
          onClick={() =>
            onReply({
              messageId: message.id,
              senderName: isSender ? 'You' : message.sender?.name || 'User',
              content: message.content,
            })
          }
          className={cn(
            'absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-muted-foreground hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer shadow-sm',
            isSender ? '-left-8' : '-right-8',
          )}
          title="Reply"
        >
          <Reply size={14} />
        </button>
      )}

      {/* Bubble Container */}
      <div
        dir="auto"
        className={cn(
          'relative px-3.5 py-2 shadow-sm wrap-break-word',
          isSender
            ? status === 'error'
              ? 'bg-red-500/10 text-white rounded-2xl rounded-br-xs border border-red-500/30'
              : 'bg-white/15 text-white rounded-2xl rounded-br-xs border border-white/15'
            : 'bg-white/5 text-white/95 rounded-2xl rounded-bl-xs border border-white/10',
        )}
      >
        {/* Quoted Reply Box */}
        {replyTo && (
          <div
            dir="ltr"
            className={cn(
              'mb-2 flex items-stretch gap-2.5 py-1 px-2.5 rounded-lg text-left text-xs',
              isSender ? 'bg-black/30 text-white' : 'bg-white/5 text-white/90',
            )}
          >
            {/* Telegram straight accent line */}
            <span
              className={cn(
                'w-[2.5px] rounded-full shrink-0 self-stretch my-0.5',
                isSender ? 'bg-white' : 'bg-white/80',
              )}
            />
            <div className="flex flex-col min-w-0 justify-center">
              <span
                dir="auto"
                className={cn(
                  'font-semibold text-[11px] truncate leading-tight text-start',
                  isSender ? 'text-white' : 'text-white/90',
                )}
              >
                {replyTo.senderName}
              </span>
              <span
                dir="auto"
                className={cn(
                  'text-[11.5px] truncate max-w-xs leading-normal mt-0.5 text-start',
                  isSender ? 'text-white/70' : 'text-white/60',
                )}
              >
                {replyTo.content}
              </span>
            </div>
          </div>
        )}

        {/* Message Text Body */}
        <p dir="auto" className="whitespace-pre-wrap select-text leading-relaxed text-start">
          {content}
        </p>
      </div>

      {/* Message Status Under Bubble */}
      <div
        className={cn(
          'flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground select-none px-1',
          isSender ? 'justify-end' : 'justify-start',
        )}
      >
        <span>{formatMessageTime(createdAt)}</span>
        {isEdited && <span className="text-[10px] italic">edited</span>}
        {isSender && (
          <span
            className="inline-flex items-center ml-0.5"
            title={
              status === 'sending'
                ? 'Sending...'
                : status === 'error'
                  ? 'Failed to send'
                  : isRead || status === 'seen'
                    ? 'Seen'
                    : 'Sent'
            }
          >
            {status === 'sending' ? (
              <Clock className="w-3.5 h-3.5 text-white/50 animate-pulse" />
            ) : status === 'error' ? (
              <button
                type="button"
                onClick={() => onRetry?.(message)}
                className="inline-flex items-center text-red-500 hover:text-red-400 cursor-pointer transition-colors"
                title="Failed to send. Click to retry."
              >
                <AlertCircle className="w-3.5 h-3.5" />
              </button>
            ) : isRead || status === 'seen' ? (
              <CheckCheck className="w-3.5 h-3.5 text-white" />
            ) : (
              <Check className="w-3.5 h-3.5 text-white/40" />
            )}
          </span>
        )}
      </div>
    </div>
  );
}
