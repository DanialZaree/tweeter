'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, CheckCheck } from 'lucide-react';
import { ConversationListItem } from '../types';
import { getGradientFromName } from '@/app/lib/avatar';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  item: ConversationListItem;
  isActive?: boolean;
}

export function formatChatTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (isYesterday) {
    return 'Yesterday';
  }
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ConversationItem({ item, isActive = false }: ConversationItemProps) {
  const { participant, lastMessage, unreadCount } = item;
  const avatarUrl = participant.avatar || participant.image;
  const initial = (participant.name || participant.userName || '?')[0].toUpperCase();
  const gradientClass = getGradientFromName(participant.userName);
  const href = `/chat/${participant.userName}`;

  return (
    <Link
      href={href}
      className={cn(
        'w-full flex items-center gap-3 px-3.5 py-3 transition-colors text-left select-none relative group border-b border-white/10 cursor-pointer',
        isActive
          ? 'bg-white/10 border-l-2 border-l-white'
          : 'hover:bg-white/[0.04] active:bg-white/[0.08]',
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0 w-12 h-12">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={participant.name || participant.userName || 'Avatar'}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-inner text-lg',
              gradientClass,
            )}
          >
            {initial}
          </div>
        )}
        {participant.isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0b0f14] rounded-full" />
        )}
      </div>

      {/* Main Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="font-semibold text-white text-[15px] truncate tracking-tight">
            {participant.name || `@${participant.userName}`}
          </span>
          {lastMessage && (
            <span className="text-[12px] text-muted-foreground shrink-0 font-medium">
              {formatChatTime(lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-[13.5px] text-muted-foreground truncate leading-snug flex items-center gap-1 min-w-0">
            {lastMessage?.isSender && (
              <span className="shrink-0 inline-flex items-center text-white/70">
                {lastMessage.isRead ? (
                  <CheckCheck className="w-3.5 h-3.5" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
              </span>
            )}
            <span className="truncate">{lastMessage ? lastMessage.text : 'No messages yet'}</span>
          </p>

          {unreadCount > 0 && (
            <span className="shrink-0 min-w-[24px] h-6 px-1.5 bg-white text-black font-extrabold text-[13px] leading-none rounded-full flex items-center justify-center shadow-md">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
