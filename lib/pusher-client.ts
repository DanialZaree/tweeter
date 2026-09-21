'use client';

import Pusher from 'pusher-js';

let client: Pusher | undefined;

export const getPusherClient = (): Pusher => {
  return (client ??= new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'app-key', {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
    wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST || 'ws.boblo.ir',
    wsPort: 443,
    wssPort: 443,
    forceTLS: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
  }));
};
