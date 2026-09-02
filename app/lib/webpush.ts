import webpush from 'web-push';
import prisma from './prisma';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:test@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export async function sendPushNotification(
  userId: string,
  payload: { title: string; body: string; url?: string; icon?: string; badge?: string },
) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys are not set, skipping push notification');
    return;
  }

  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      return;
    }

    const payloadString = JSON.stringify(payload);

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                auth: sub.auth,
                p256dh: sub.p256dh,
              },
            },
            payloadString,
          );
        } catch (error: any) {
          if (error.statusCode === 404 || error.statusCode === 410) {
            // Subscription has expired or is no longer valid
            await prisma.pushSubscription.delete({
              where: { id: sub.id },
            });
          } else {
            console.error('Error sending push notification:', error);
          }
        }
      }),
    );
  } catch (error) {
    console.error('Failed to send push notifications:', error);
  }
}
