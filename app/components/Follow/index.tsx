'use client';

import { followUser } from '@/app/lib/actions/actionFollow';

export default function Follow({ userId, followerId }: { userId: string; followerId: string }) {
  async function followHandler() {
    const result = await followUser(userId, followerId);
  }
  return (
    <div className="flex justify-end items-center gap-2 px-4 pt-3 pb-0">
      <button
        onClick={followHandler}
        className="hover:bg-white/10 px-4 py-1.5 border border-white/20 rounded-full font-bold text-[14px] transition-colors"
      >
        Follow
      </button>
    </div>
  );
}
