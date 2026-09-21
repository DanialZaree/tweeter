'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { unreadCount } from '@/app/lib/actions/actionNotif';
import { usePusherChannel } from '@/hooks/use-pusher-channel';

export default function NavbarBell({
  initialCount = 0,
  isLoggedIn = false,
  userId,
}: {
  initialCount?: number;
  isLoggedIn?: boolean;
  userId?: string;
}) {
  const queryClient = useQueryClient();

  const { data: count = initialCount } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: async () => {
      const res = await unreadCount();
      return res.count ?? 0;
    },
    initialData: initialCount,
    enabled: isLoggedIn,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  });

  usePusherChannel(isLoggedIn && userId ? `user-${userId}` : null, 'notification:new', () => {
    queryClient.setQueryData(
      ['notifications', 'unreadCount'],
      (prev: number = 0) => (prev ?? 0) + 1,
    );
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
  });

  return (
    <Link
      href="/notifications"
      aria-label="Notifications"
      className="relative hover:bg-white/10 p-2 rounded-full transition-colors text-white cursor-pointer"
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="top-1.5 right-1.5 absolute flex justify-center items-center bg-blue-600 rounded-full min-w-4 h-4 font-bold text-[10px] text-white px-1">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
