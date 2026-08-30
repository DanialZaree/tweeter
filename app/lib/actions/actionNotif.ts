'use server';

import prisma from '../prisma';
import { auth } from '@/app/auth';
import { revalidatePath } from 'next/cache';
import { checkRateLimit } from '@/app/lib/ratelimit';

const safeSenderSelect = {
  id: true,
  name: true,
  userName: true,
  avatar: true,
  image: true,
};

function isDynamicServerError(err: any): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err.digest === 'DYNAMIC_SERVER_USAGE' ||
      err.message?.includes('Dynamic server usage') ||
      err.name === 'DynamicServerError')
  );
}

export async function getNotif() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: 'Unauthorized', notifications: [] };
    }

    const rateCheck = await checkRateLimit(`get_notif:${userId}`, 30, 60);
    if (!rateCheck.success) {
      return { success: false, error: rateCheck.error, notifications: [] };
    }

    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: {
          select: safeSenderSelect,
        },
        tweet: {
          select: {
            tweetId: true,
          },
        },
      },
    });

    return { success: true, notifications };
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error('Error in getting notifications: ', error);
    return { success: false, error: 'Failed to fetch notifications', notifications: [] };
  }
}

export async function markAsRead() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return { success: false, error: 'Unauthorized' };

    const rateCheck = await checkRateLimit(`mark_read:${userId}`, 10, 60);
    if (!rateCheck.success) {
      return { success: false, error: rateCheck.error };
    }

    await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error('Error marking as read: ', error);
    return { success: false };
  }
}

export async function unreadCount() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, count: 0, error: 'Unauthorized' };
    }

    const count = await prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    return { success: true, count };
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error('Error in getting unread count: ', error);
    return { success: false, count: 0, error: 'Failed to fetch unread count' };
  }
}
