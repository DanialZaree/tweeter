import Pusher from 'pusher';

const globalPusher = globalThis as unknown as { pusherServer?: Pusher };

export const pusherServer = (globalPusher.pusherServer ??= new Pusher({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID || 'app-id',
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'app-key',
  secret: process.env.PUSHER_APP_SECRET || 'app-secret',
  host: process.env.NEXT_PUBLIC_PUSHER_HOST || 'ws.boblo.ir',
  port: process.env.NEXT_PUBLIC_PUSHER_PORT || '443',
  useTLS: true,
}));
