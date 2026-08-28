'use server';

import prisma from '../prisma';
import { auth } from '@/app/auth';
import { revalidatePath } from 'next/cache';

const safeSenderSelect = {
  id: true,
  name: true,
  userName: true,
  avatar: true,
  image: true,
};

export async function getNotif() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: 'Unauthorized', notifications: [] };
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
    console.error('Error in geting notifications: ', error);
    return { success: false, error: 'Failed to fetch notifications', notifications: [] };
  }
}

export async function markAsRead() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return { success: false, error: 'Unauthorized' };

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
    console.error('Error in getting unread count: ', error);
    return { success: false, count: 0, error: 'Failed to fetch unread count' };
  }
}
