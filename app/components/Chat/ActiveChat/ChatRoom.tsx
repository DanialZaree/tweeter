'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, X } from 'lucide-react';
import MessageBubble from './MessageBubble';
import DateDivider from './DateDivider';
import ChatInput from '../ChatInput';
import { ChatUser, ChatMessage, ReplyContext } from '../types';
import { sendMessage, markMessagesAsRead } from '@/app/lib/actions/actionChat';
import { usePusherChannel } from '@/hooks/use-pusher-channel';
import { useChatStore } from '../store';
import { getGradientFromName } from '@/app/lib/avatar';
import { cn } from '@/lib/utils';

interface ChatRoomProps {
  currentUserId: string;
  conversationId: string;
  participant: ChatUser;
  initialMessages: ChatMessage[];
}

function getDateLabel(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ChatRoom({
  currentUserId,
  conversationId,
  participant,
  initialMessages,
}: ChatRoomProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [replyContext, setReplyContext] = useState<ReplyContext | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const avatarUrl = participant.avatar || participant.image;
  const initial = (participant.name || participant.userName || '?')[0].toUpperCase();
  const gradientClass = getGradientFromName(participant.userName);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Mark existing unread messages as read when room mounts
  useEffect(() => {
    if (conversationId) {
      markMessagesAsRead(conversationId);
      useChatStore.getState().markConversationRead(conversationId);
    }
  }, [conversationId]);

  // Real-time updates via Pusher
  usePusherChannel<ChatMessage>(
    conversationId ? `conversation-${conversationId}` : null,
    'message:new',
    (incoming) => {
      if (!incoming) return;
      const createdAt = typeof incoming.createdAt === 'string' ? incoming.createdAt : new Date(incoming.createdAt).toISOString();
      const isMe = incoming.senderId === currentUserId;

      if (!isMe) {
        markMessagesAsRead(conversationId);
        useChatStore.getState().upsertMessage({
          conversationId,
          content: incoming.content,
          createdAt,
          isSender: false,
          isRead: true,
          unreadIncrement: false,
          participant,
        });
      } else {
        useChatStore.getState().upsertMessage({
          conversationId,
          content: incoming.content,
          createdAt,
          isSender: true,
          isRead: false,
          participant,
        });
      }

      setMessages((prev) => {
        if (prev.some((m) => m.id === incoming.id)) return prev;
        if (isMe) {
          const optIdx = prev.findIndex((m) => m.id.startsWith('temp-') && m.content === incoming.content);
          if (optIdx !== -1) {
            const next = [...prev];
            next[optIdx] = incoming;
            return next;
          }
        }
        return [...prev, incoming];
      });
    },
  );

  // Listen for read receipts
  usePusherChannel<{ conversationId: string; readerId: string }>(
    conversationId ? `conversation-${conversationId}` : null,
    'messages:read',
    (readEvent) => {
      if (readEvent && readEvent.readerId !== currentUserId) {
        setMessages((prev) => prev.map((m) => (m.senderId === currentUserId ? { ...m, isRead: true } : m)));
        useChatStore.getState().updateReadReceipt(conversationId);
      }
    },
  );

  const handleSendMessage = async (content: string, replyCtx?: ReplyContext | null) => {
    const optimisticId = `temp-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      conversationId,
      senderId: currentUserId,
      content,
      replyToId: replyCtx?.messageId || null,
      replyTo: replyCtx ? { id: replyCtx.messageId, senderName: replyCtx.senderName, content: replyCtx.content } : null,
      isRead: false,
      status: 'sending',
      createdAt: nowIso,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    useChatStore.getState().upsertMessage({
      conversationId,
      content,
      createdAt: nowIso,
      isSender: true,
      isRead: false,
      participant,
    });

    try {
      const res = await sendMessage(conversationId, content, replyCtx?.messageId);
      if (res.success && res.message) {
        const realMsg: ChatMessage = { ...(res.message as ChatMessage), status: 'sent' };
        useChatStore.getState().upsertMessage({
          conversationId,
          content: realMsg.content,
          createdAt: typeof realMsg.createdAt === 'string' ? realMsg.createdAt : new Date(realMsg.createdAt).toISOString(),
          isSender: true,
          isRead: false,
          participant,
        });

        setMessages((prev) => {
          if (prev.some((m) => m.id === realMsg.id)) {
            return prev.filter((m) => m.id !== optimisticId);
          }
          return prev.map((m) => (m.id === optimisticId ? realMsg : m));
        });
      } else {
        if (res.error) setErrorMessage(res.error);
        setMessages((prev) => prev.map((m) => (m.id === optimisticId ? { ...m, status: 'error' } : m)));
      }
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === optimisticId ? { ...m, status: 'error' } : m)));
    }
  };

  const handleRetryMessage = (failedMsg: ChatMessage) => {
    setMessages((prev) => prev.filter((m) => m.id !== failedMsg.id));
    handleSendMessage(
      failedMsg.content,
      failedMsg.replyTo
        ? { messageId: failedMsg.replyTo.id, senderName: failedMsg.replyTo.senderName, content: failedMsg.replyTo.content }
        : null,
    );
  };

  const handleBack = () => {
    router.push('/chat');
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#0b0f14] flex justify-center overflow-hidden">
      <div className="w-full h-full max-w-2xl border-x-0 sm:border-x border-white/10 flex flex-col bg-[#0b0f14] overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-black/80 backdrop-blur-md border-b border-white/10 z-20 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={handleBack}
              className="p-1.5 -ml-1 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Back to chats"
            >
              <ArrowLeft size={22} />
            </button>

            <Link href={`/${participant.userName}`} className="flex items-center gap-2.5 min-w-0 hover:opacity-90 transition-opacity">
              <div className="relative shrink-0 w-10 h-10">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={participant.name || participant.userName || 'Avatar'} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-base shadow-inner', gradientClass)}>
                    {initial}
                  </div>
                )}
                {participant.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0b0f14] rounded-full" />
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-white text-sm sm:text-[15px] truncate hover:underline">
                  {participant.name || `@${participant.userName}`}
                </span>
                <span className="text-[12px] text-muted-foreground truncate">
                  {participant.isOnline ? <span className="text-emerald-400 font-medium">online</span> : participant.lastSeen || 'last seen recently'}
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 flex flex-col justify-start relative">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
              <div className="p-4 bg-white/10 text-white rounded-full mb-3">
                <ShieldAlert size={28} />
              </div>
              <h3 className="font-semibold text-white text-sm">Direct Conversation</h3>
              <p className="text-xs text-muted-foreground max-w-xs mt-1">
                No messages here yet. Send a greeting to start your conversation!
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const prevMsg = messages[index - 1];
              const showDateDivider = !prevMsg || new Date(prevMsg.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

              return (
                <div key={msg.id} className="flex flex-col w-full">
                  {showDateDivider && <DateDivider dateText={getDateLabel(msg.createdAt)} />}
                  <MessageBubble
                    message={msg}
                    isSender={msg.senderId === currentUserId}
                    onReply={(ctx) => setReplyContext(ctx)}
                    onRetry={handleRetryMessage}
                  />
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Rate limit / send error message banner */}
        {errorMessage && (
          <div className="mx-3 sm:mx-4 mb-2 px-3.5 py-2 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400 flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-0.5 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Chat Input */}
        <ChatInput
          replyContext={replyContext}
          onCancelReply={() => setReplyContext(null)}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
