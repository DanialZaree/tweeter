'use client';

import { useEffect, useRef } from 'react';
import { getPusherClient } from '@/lib/pusher-client';

export function usePusherChannel<T = unknown>(
  channelName: string | null | undefined,
  eventName: string,
  callback: (data: T) => void,
) {
  const cb = useRef(callback);
  cb.current = callback;

  useEffect(() => {
    if (!channelName) return;

    const channel = getPusherClient().subscribe(channelName);
    const handler = (data: T) => cb.current?.(data);

    channel.bind(eventName, handler);
    return () => {
      channel.unbind(eventName, handler);
    };
  }, [channelName, eventName]);
}
