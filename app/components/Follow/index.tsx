'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { followUser } from '@/app/lib/actions/actionFollow';

export default function Follow({
  userId,
  userName,
  isCurrentlyFollowing,
}: {
  userId: string;
  userName?: string;
  isCurrentlyFollowing?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const followHandler = () => {
    startTransition(async () => {
      try {
        await followUser(userId);
      } catch (error) {
        console.error('Failed to update follow status:', error);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {userName && (
        <Link
          href={`/chat/${userName}`}
          aria-label={`Message @${userName}`}
          title={`Message @${userName}`}
          className="flex items-center justify-center w-9 h-9 rounded-full border border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-colors cursor-pointer"
        >
          <Mail size={18} />
        </Link>
      )}
      <button
        onClick={followHandler}
        disabled={isPending}
        className="bg-white hover:bg-white/85 disabled:opacity-50 px-4 py-1.5 border border-white/20 rounded-full font-bold text-[14px] text-black transition-colors cursor-pointer"
      >
        {isPending ? 'Loading...' : isCurrentlyFollowing ? 'Unfollow' : 'Follow'}
      </button>
    </div>
  );
}
