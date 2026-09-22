'use client';

import { useState, useRef } from 'react';
import {
  Check,
  CheckCheck,
  Reply,
  Clock,
  AlertCircle,
  Copy,
  RotateCcw,
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
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

  // Swipe-to-reply and touch handling
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isHorizontalSwipe = useRef(false);
  const didSwipeRef = useRef(false);

  const triggerReply = () => {
    if (!onReply) return;
    onReply({
      messageId: message.id,
      senderName: isSender ? 'You' : message.sender?.name || 'User',
      content: message.content,
    });
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
      setTimeout(() => setIsCopied(false), 1800);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isHorizontalSwipe.current = false;
    didSwipeRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const dx = e.touches[0].clientX - touchStartPos.current.x;
    const dy = e.touches[0].clientY - touchStartPos.current.y;

    if (!isHorizontalSwipe.current) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        isHorizontalSwipe.current = true;
      } else if (Math.abs(dy) > 10) {
        return;
      }
    }

    if (isHorizontalSwipe.current) {
      didSwipeRef.current = true;
      // Swiping direction: drag towards center
      const allowed = isSender
        ? Math.min(0, Math.max(-55, dx))
        : Math.max(0, Math.min(55, dx));
      setSwipeOffset(allowed);
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(swipeOffset) >= 35) {
      triggerReply();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15);
      }
    }
    setSwipeOffset(0);
    touchStartPos.current = null;
    isHorizontalSwipe.current = false;
  };

  // Open context menu predictably on click/tap
  const handleBubbleClick = (e: React.MouseEvent) => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }

    // Trigger context menu at the tap coordinates
    const syntheticEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: e.clientX,
      clientY: e.clientY,
    });
    e.currentTarget.dispatchEvent(syntheticEvent);
  };

  return (
    <div
      className={cn(
        'group/msg relative flex items-center my-1 w-full max-w-full',
        isSender ? 'justify-end' : 'justify-start',
      )}
    >
      {/* Container for bubble + desktop reply button */}
      <div
        className={cn(
          'relative flex items-center gap-1.5 max-w-[85%] sm:max-w-[75%]',
          isSender ? 'flex-row-reverse' : 'flex-row',
        )}
      >
        {/* Desktop Quick-Reply Button (in-flow, never pushes outside layout) */}
        {onReply && (
          <button
            type="button"
            onClick={triggerReply}
            className="opacity-0 group-hover/msg:opacity-100 focus-visible:opacity-100 p-1.5 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 active:bg-white/20 transition-all shrink-0 cursor-pointer shadow-sm"
            title="Reply"
            aria-label="Reply to message"
          >
            <Reply size={14} className={isSender ? 'scale-x-[-1]' : ''} />
          </button>
        )}

        {/* Bubble & Metadata column */}
        <div className={cn('relative flex flex-col min-w-0', isSender ? 'items-end' : 'items-start')}>
          {/* Swipe reply indicator - ABSOLUTE so it NEVER affects layout or shifts timestamp */}
          {onReply && (
            <div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 flex items-center justify-center text-[#1d9bf0] pointer-events-none transition-opacity duration-150 z-0',
                isSender ? '-right-7' : '-left-7',
              )}
              style={{
                opacity: Math.min(1, Math.abs(swipeOffset) / 30),
              }}
            >
              <Reply size={16} className={isSender ? 'scale-x-[-1]' : ''} />
            </div>
          )}

          {/* Context Menu Wrap around Message Bubble */}
          <ContextMenu>
            <ContextMenuTrigger className="cursor-pointer outline-none">
              <div
                dir="auto"
                onClick={handleBubbleClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                  transform: swipeOffset !== 0 ? `translateX(${swipeOffset}px)` : undefined,
                  transition: swipeOffset === 0 ? 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)' : 'none',
                }}
                className={cn(
                  'relative z-10 px-3.5 py-2 shadow-sm break-words select-text touch-pan-y cursor-pointer active:brightness-95 transition-shadow',
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
            </ContextMenuTrigger>

            {/* Telegram-style Context Menu Content */}
            <ContextMenuContent className="min-w-44 bg-[#18222d]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 text-white animate-in fade-in-0 zoom-in-95">
              {onReply && (
                <ContextMenuItem
                  onClick={triggerReply}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium text-white hover:bg-white/10 active:bg-white/15 cursor-pointer transition-colors select-none"
                >
                  <Reply size={16} className="text-[#1d9bf0]" />
                  <span>Reply</span>
                </ContextMenuItem>
              )}

              <ContextMenuItem
                onClick={handleCopy}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium text-white hover:bg-white/10 active:bg-white/15 cursor-pointer transition-colors select-none"
              >
                {isCopied ? (
                  <>
                    <Check size={16} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="text-white/70" />
                    <span>Copy Text</span>
                  </>
                )}
              </ContextMenuItem>

              {status === 'error' && onRetry && (
                <>
                  <ContextMenuSeparator className="my-1 bg-white/10" />
                  <ContextMenuItem
                    onClick={() => onRetry(message)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium text-red-400 hover:bg-red-500/10 active:bg-red-500/20 cursor-pointer transition-colors select-none"
                  >
                    <RotateCcw size={16} className="text-red-400" />
                    <span>Retry sending</span>
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>

          {/* Message Status Under Bubble - NEVER MOVES when dragging! */}
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
      </div>
    </div>
  );
}
