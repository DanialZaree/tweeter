'use client';

import { useState } from 'react';
import FollowListModal from '../FollowListModal';

interface FollowStatsProps {
  userId: string;
  followersCount: number;
  followingCount: number;
  className?: string;
}

export default function FollowStats({
  userId,
  followersCount,
  followingCount,
  className = '',
}: FollowStatsProps) {
  const [modalTab, setModalTab] = useState<'followers' | 'following' | null>(null);

  const stats = [
    { label: 'Following', count: followingCount, tab: 'following' as const },
    { label: 'Followers', count: followersCount, tab: 'followers' as const },
  ];

  return (
    <>
      <div className={`flex items-center gap-3 sm:gap-4 sm:text-[14px] text-xs shrink-0 ${className}`}>
        {stats.map(({ label, count, tab }) => (
          <button
            key={tab}
            type="button"
            onClick={() => setModalTab(tab)}
            className="hover:underline underline-offset-2 cursor-pointer transition-colors"
          >
            <span className="font-bold text-white">{count}</span>
            <span className="ml-1 text-white/50">{label}</span>
          </button>
        ))}
      </div>

      <FollowListModal
        isOpen={!!modalTab}
        onClose={() => setModalTab(null)}
        userId={userId}
        initialTab={modalTab ?? 'followers'}
        followersCount={followersCount}
        followingCount={followingCount}
      />
    </>
  );
}
