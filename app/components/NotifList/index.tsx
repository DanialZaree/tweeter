'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useTransition } from 'react';
import Avatar from '../ui/Avatar';
import { markAsRead } from '@/app/lib/actions/actionNotif';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Repeat2, UserPlus, BellOff, AtSign } from 'lucide-react';

export interface NotifItem {
  id: string;
  recipientId: string;
  senderId: string;
  type: 'LIKE' | 'REPLY' | 'RETWEET' | 'FOLLOW' | 'MENTION';
  tweetId?: string | null;
  isRead: boolean;
  createdAt: Date | string;
  sender: {
    id: string;
    name: string | null;
    userName: string | null;
    avatar: string | null;
    image: string | null;
  };
  tweet?: {
    id: string;
    tweetId?: string | null;
    content: string;
    mediaUrl?: string | null;
  } | null;
}

interface NotifListProps {
  initialNotifications: NotifItem[];
}

function timeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);

  const diffInSec = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSec < 60) return 'just now';
  const minute = Math.floor(diffInSec / 60);
  if (minute < 60) return `${minute}m ago`;
  const hour = Math.floor(minute / 60);
  if (hour < 60) return `${hour}h ago`;
  const day = Math.floor(hour / 24);
  if (day < 356) return `${day}d ago`;
  return past.toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: 'numeric' });
}

export default function NotifList({ initialNotifications }: NotifListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const notifications = initialNotifications;

  useEffect(() => {
    const hasUnread = initialNotifications.some((notif) => !notif.isRead);

    if (hasUnread) {
      markAsRead();
    }
  }, [initialNotifications]);

  const renderTypeIcon = (type: NotifItem['type']) => {
    switch (type) {
      case 'LIKE':
        return (
          <div className="bg-rose-500/20 p-2 rounded-full text-rose-500">
            <Heart className="w-4 h-4 fill-rose-500" />
          </div>
        );
      case 'REPLY':
        return (
          <div className="bg-sky-500/20 p-2 rounded-full text-sky-400">
            <MessageCircle className="w-4 h-4 fill-sky-400/20" />
          </div>
        );
      case 'RETWEET':
        return (
          <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
            <Repeat2 className="w-4 h-4" />
          </div>
        );
      case 'FOLLOW':
        return (
          <div className="bg-purple-500/20 p-2 rounded-full text-purple-400">
            <UserPlus className="w-4 h-4" />
          </div>
        );
      case 'MENTION':
        return (
          <div className="bg-amber-500/20 p-2 rounded-full text-amber-400">
            <AtSign className="w-4 h-4" />
          </div>
        );
    }
  };

  const renderDescription = (notif: NotifItem) => {
    const name = notif.sender.userName || notif.sender.name || 'Someone';
    const userUrl = `/${notif.sender.userName}`;
    const tweetUrl = notif.tweetId ? `/tweet/${notif.tweet?.tweetId || notif.tweetId}` : '#';

    const UserLink = (
      <Link
        href={userUrl}
        onClick={(e) => e.stopPropagation()}
        className="font-bold text-white hover:underline"
      >
        {name}
      </Link>
    );

    const TargetLink = (text: string) => (
      <Link
        href={tweetUrl}
        onClick={(e) => e.stopPropagation()}
        className="text-white hover:underline font-medium"
      >
        {text}
      </Link>
    );

    switch (notif.type) {
      case 'LIKE':
        return (
          <div className="flex flex-col min-w-0">
            <span>
              {UserLink} liked your{TargetLink(' tweet')}
            </span>
          </div>
        );
      case 'REPLY':
        return (
          <div className="flex flex-col min-w-0">
            <span>
              {UserLink} replied to your{TargetLink(' tweet')}
            </span>
          </div>
        );
      case 'RETWEET':
        return (
          <div className="flex flex-col min-w-0">
            <span>
              {UserLink} reposted your{TargetLink(' tweet')}
            </span>
          </div>
        );
      case 'FOLLOW':
        return (
          <div className="flex flex-col min-w-0">
            <span>{UserLink} started following you</span>
          </div>
        );
      case 'MENTION':
        return (
          <div className="flex flex-col min-w-0">
            <span>
              {UserLink} mentioned you in a{TargetLink(' tweet')}
            </span>
          </div>
        );
    }
  };

  const getTargetUrl = (notif: NotifItem) => {
    if (notif.type == 'FOLLOW') {
      return `/${notif.sender.userName}`;
    }
    if (notif.tweetId) {
      return `/tweet/${notif.tweet?.tweetId || notif.tweetId}`;
    }
    return '#';
  };

  return (
    <div className="flex flex-col gap-4 pb-20 w-full">
      {notifications.length === 0 ? (
        <div className="flex flex-col justify-center items-center gap-3 bg-neutral-900/30 p-12 border border-white/5 rounded-3xl text-center">
          <div className="bg-white/5 p-4 rounded-full text-neutral-400">
            <BellOff className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-lg text-white">No notifications</h3>
          <p className="max-w-xs text-neutral-400 text-sm">
            When people interact with you or your posts, you'll find it here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => router.push(getTargetUrl(notif))}
              className={`cursor-pointer group relative flex items-start gap-3.5 p-2 rounded-2xl border transition-all duration-200 ${
                notif.isRead
                  ? 'bg-neutral-950/40 border-white/5 hover:bg-white/3'
                  : 'bg-neutral-900/90 border-blue-500/30 hover:border-blue-500/50 shadow-lg shadow-blue-500/5'
              }`}
            >
              {!notif.isRead && (
                <span className="top-4 left-2 absolute bg-blue-500 rounded-full w-1.5 h-1.5 animate-pulse" />
              )}

              <div className="flex flex-col flex-1 gap-1.5 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0">
                    <Link href={`/${notif.sender.userName}`} onClick={(e) => e.stopPropagation()}>
                      <Avatar name={notif.sender.name} image={notif.sender.avatar} size={40} className="rounded-full shadow-sm" />
                    </Link>
                  </div>
                  
                  <div className="flex-1 text-neutral-200 text-sm min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {renderTypeIcon(notif.type)}
                      <span className="text-[11px] text-neutral-500 font-medium whitespace-nowrap">
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                    {renderDescription(notif)}
                  </div>
                  
                  <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-white/5">
                    <Image
                      src="/icons/logo.svg"
                      alt="Boblo"
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain opacity-70 hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
