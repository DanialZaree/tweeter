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
  Link2,
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { ChatMessage, ReplyContext } from '../types';
import { renderTweetContent } from '@/app/lib/renderTweetContent';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  isSender: boolean;
  onReply?: (context: ReplyContext) => void;
  onRetry?: (message: ChatMessage) => void;
}

function formatMessageTime(dateInput: string | Date): string {
  return new Date(dateInput).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function MessageBubble({ message, isSender, onReply, onRetry }: MessageBubbleProps) {
  const { content, replyTo, isRead, isEdited, createdAt, status } = message;

  // Touch & Swipe states
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [copiedType, setCopiedType] = useState<'text' | 'link' | null>(null);
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

  const copyItem = async (type: 'text' | 'link') => {
    const value =
      type === 'text'
        ? content
        : `${window.location.origin}${window.location.pathname}#msg-${message.id}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const ta = document.createElement('textarea');
        ta.value = value;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedType(type);
      navigator.vibrate?.(10);
      setTimeout(() => setCopiedType(null), 1800);
    } catch (err) {
      console.error('Failed to copy:', err);
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
      setSwipeOffset(isSender ? Math.min(0, Math.max(-55, dx)) : Math.max(0, Math.min(55, dx)));
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(swipeOffset) >= 35) {
      triggerReply();
      navigator.vibrate?.(15);
    }
    setSwipeOffset(0);
    touchStartPos.current = null;
    isHorizontalSwipe.current = false;
  };

  // Open context menu predictably on click/tap
  const handleBubbleClick = (e: React.MouseEvent) => {
    if (didSwipeRef.current || (typeof window !== 'undefined' && window.getSelection()?.toString())) {
      didSwipeRef.current = false;
      return;
    }

    e.currentTarget.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: e.clientX,
        clientY: e.clientY,
      }),
    );
  };

  const renderStatusIcon = () => {
    if (!isSender) return null;
    if (status === 'sending') return <Clock className="w-3.5 h-3.5 text-white/50 animate-pulse" />;
    if (status === 'error') {
      return (
        <button
          type="button"
          onClick={() => onRetry?.(message)}
          className="text-red-500 hover:text-red-400 cursor-pointer transition-colors"
          title="Failed to send. Click to retry."
        >
          <AlertCircle className="w-3.5 h-3.5" />
        </button>
      );
    }
    return isRead || status === 'seen' ? (
      <CheckCheck className="w-3.5 h-3.5 text-white" />
    ) : (
      <Check className="w-3.5 h-3.5 text-white/40" />
    );
  };

  return (
    <div
      className={cn(
        'group/msg relative flex my-1 w-full select-text px-2',
        isSender ? 'justify-end' : 'justify-start',
      )}
    >
      {/* Bubble & Metadata column */}
      <div
        className={cn(
          'relative flex flex-col min-w-0 max-w-[85%] sm:max-w-[75%]',
          isSender ? 'items-end' : 'items-start',
        )}
      >
        <ContextMenu>
          <ContextMenuTrigger className="cursor-pointer outline-none">
            <div
              id={`msg-${message.id}`}
              dir="auto"
              onClick={handleBubbleClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                transform: swipeOffset !== 0 ? `translateX(${swipeOffset}px)` : undefined,
                transition: swipeOffset === 0 ? 'transform 0.2s cubic-bezier(0.2, 0, 1)' : 'none',
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
                      {renderTweetContent(replyTo.content)}
                    </span>
                  </div>
                </div>
              )}

              {/* Message Text Body with rich links, mentions, and iOS emojis */}
              <p dir="auto" className="whitespace-pre-wrap select-text leading-relaxed text-start">
                {renderTweetContent(content)}
              </p>
            </div>
          </ContextMenuTrigger>

          {/* Context Menu Content */}
          <ContextMenuContent className="w-[195px]">
            {onReply && (
              <ContextMenuItem onClick={triggerReply}>
                <Reply />
                <span>Reply</span>
              </ContextMenuItem>
            )}

            <ContextMenuItem onClick={() => copyItem('text')}>
              {copiedType === 'text' ? <Check className="text-emerald-400" /> : <Copy />}
              <span className={copiedType === 'text' ? 'text-emerald-400' : ''}>
                {copiedType === 'text' ? 'Copied!' : 'Copy Text'}
              </span>
            </ContextMenuItem>

            <ContextMenuItem onClick={() => copyItem('link')}>
              {copiedType === 'link' ? <Check className="text-emerald-400" /> : <Link2 />}
              <span className={copiedType === 'link' ? 'text-emerald-400' : ''}>
                {copiedType === 'link' ? 'Copied!' : 'Copy Link'}
              </span>
            </ContextMenuItem>

            {status === 'error' && onRetry && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem variant="destructive" onClick={() => onRetry(message)}>
                  <RotateCcw />
                  <span>Retry sending</span>
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>

        {/* Message Status Under Bubble - Anchored in place during swipe */}
        <div
          className={cn(
            'flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground select-none px-1',
            isSender ? 'justify-end' : 'justify-start',
          )}
        >
          <span>{formatMessageTime(createdAt)}</span>
          {isEdited && <span className="text-[10px] italic">edited</span>}
          {renderStatusIcon()}
        </div>
      </div>
    </div>
  );
}
