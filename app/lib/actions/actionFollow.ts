'use server';

import { auth } from '@/app/auth';
import prisma from '../prisma';
import { revalidatePath } from 'next/cache';
import { checkRateLimit } from '@/app/lib/ratelimit';
import { sendAppNotification } from '@/app/lib/notifications';

export async function followUser(targetUserId: string) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return { error: 'Unauthorized' };
  }

  const rateCheck = await checkRateLimit(`follow:${currentUserId}`, 20, 60);
  if (!rateCheck.success) {
    return { error: rateCheck.error || 'Rate limit exceeded. Please wait a bit.' };
  }

  if (targetUserId === currentUserId) {
    return { error: 'You cannot follow yourself' };
  }

  try {
    const existingFollow = await prisma.follower.findUnique({
      where: {
        userId_followerId: {
          userId: targetUserId,
          followerId: currentUserId,
        },
      },
      select: { id: true },
    });

    const isCurrentlyFollowing = !!existingFollow;

    if (existingFollow) {
      await prisma.follower.delete({
        where: {
          userId_followerId: {
            userId: targetUserId,
            followerId: currentUserId,
          },
        },
      });

      await prisma.notification.deleteMany({
        where: {
          recipientId: targetUserId,
          senderId: currentUserId,
          type: 'FOLLOW',
        },
      });
    } else {
      await prisma.follower.create({
        data: {
          userId: targetUserId,
          followerId: currentUserId,
        },
      });

      await sendAppNotification({
        type: 'FOLLOW',
        senderId: currentUserId,
        senderName: session.user?.name || 'Someone',
        recipientId: targetUserId,
        urlOverride: `/${session.user?.userName || 'profile'}`,
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { userName: true },
    });
    if (targetUser?.userName) {
      revalidatePath(`/${targetUser.userName}`);
    }
    revalidatePath('/');
    return {
      success: true,
      followerId: currentUserId,
      isFollowing: !isCurrentlyFollowing,
    };
  } catch (e) {
    console.error('Error toggling follow status:', e);
    return { error: 'Failed to update follow status. Please try again.' };
  }
}
