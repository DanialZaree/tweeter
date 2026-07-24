'use client';

import { useTransition } from 'react';
import { followUser } from '@/app/lib/actions/actionFollow';

export default function Follow({
  userId,
  followerId,
  isCurrentlyFollowing,
}: {
  userId: string;
  followerId: string;
  isCurrentlyFollowing?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const followHandler = () => {
    startTransition(async () => {
      try {
        await followUser(userId, followerId);
      } catch (error) {
        console.error('Failed to update follow status:', error);
      }
    });
  };

  return (
    <div className="flex justify-end items-center gap-2 px-4 pt-3 pb-0">
      <button
        onClick={followHandler}
        disabled={isPending}
        className="hover:bg-white/10 disabled:opacity-50 px-4 py-1.5 border border-white/20 rounded-full font-bold text-[14px] transition-colors"
      >
        {isPending
          ? 'Loading...'
          : isCurrentlyFollowing
          ? 'Unfollow'
          : 'Follow'}
      </button>
    </div>
  );
}