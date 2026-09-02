'use client';

import { useState, useEffect } from 'react';
import { savePushSub } from '@/app/lib/actions/push';
import { Bell, BellRing, Loader2, XCircle } from 'lucide-react';

function urlB64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);

          // Auto-prompt if not subscribed and permission hasn't been denied
          if (!sub && 'Notification' in window && Notification.permission === 'default') {
            setTimeout(() => {
              subscribeToPush();
            }, 3000);
          }
        });
      });
    }
  }, []);

  const subscribeToPush = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Permission denied for push notifications.');
        setIsLoading(false);
        return;
      }

      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        await navigator.serviceWorker.register('/sw.js');
      }

      // Ensure the service worker is fully active and ready before subscribing
      registration = await navigator.serviceWorker.ready;

      if (!registration) {
        setError('Service worker not registered.');
        setIsLoading(false);
        return;
      }

      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicVapidKey) {
        setError('VAPID public key is missing');
        setIsLoading(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(publicVapidKey),
      });

      const subJSON = subscription.toJSON();

      await savePushSub(subJSON);

      setIsSubscribed(true);
    } catch (err) {
      console.error('Failed to subscribe:', err);
      setError('Failed to enable notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 text-sm font-semibold w-fit">
        <BellRing size={16} />
        Push Notifications Enabled
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 items-center w-fit">
      <button
        onClick={subscribeToPush}
        disabled={isLoading}
        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed w-fit"
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
        {isLoading ? 'Enabling...' : 'Enable Push Notifications'}
      </button>
      {error && (
        <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium px-2">
          <XCircle size={14} />
          {error}
        </span>
      )}
    </div>
  );
}
