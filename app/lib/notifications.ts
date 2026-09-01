import prisma from './prisma';
import { sendPushNotification } from './webpush';
import { NotificationType } from '@prisma/client';

interface AppNotificationProps {
  type: NotificationType;
  senderId: string;
  senderName: string;
  recipientId: string;
  tweetId?: string | null;
  urlOverride?: string;
}

export async function sendAppNotification({
  type,
  senderId,
  senderName,
  recipientId,
  tweetId,
  urlOverride,
}: AppNotificationProps) {
  if (senderId === recipientId) return;

  await prisma.notification.create({
    data: {
      type,
      senderId,
      recipientId,
      tweetId,
    },
  });

  let title = 'New Notification';
  let body = `${senderName} sent you a notification.`;
  let url = urlOverride || '/notifications';

  switch (type) {
    case 'LIKE':
      title = 'New Like';
      body = `${senderName} liked your tweet.`;
      url = urlOverride || (tweetId ? `/tweet/${tweetId}` : '/notifications');
      break;
    case 'FOLLOW':
      title = 'New Follower';
      body = `${senderName} started following you.`;
      break;
    case 'REPLY':
      title = 'New Reply';
      body = `${senderName} replied to your tweet.`;
      url = urlOverride || (tweetId ? `/tweet/${tweetId}` : '/notifications');
      break;
    case 'RETWEET':
      title = 'New Retweet';
      body = `${senderName} retweeted your tweet.`;
      url = urlOverride || (tweetId ? `/tweet/${tweetId}` : '/notifications');
      break;
    case 'MENTION':
      title = 'New Mention';
      body = `${senderName} mentioned you in a tweet.`;
      url = urlOverride || (tweetId ? `/tweet/${tweetId}` : '/notifications');
      break;
  }

  await sendPushNotification(recipientId, { title, body, url });
}
