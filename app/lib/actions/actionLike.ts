'use server';

import prisma from '../prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/app/auth';
import { checkRateLimit } from '@/app/lib/ratelimit';

export async function toggleTweetLike(tweetId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const rateCheck = await checkRateLimit(`like:${userId}`, 30, 60);
    if (!rateCheck.success) {
      return {
        success: false,
        error: rateCheck.error || 'Rate limit exceeded. Please wait a bit.',
      };
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_tweetId: {
          userId: userId,
          tweetId: tweetId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_tweetId: {
            userId: userId,
            tweetId: tweetId,
          },
        },
      });
    } else {
      await prisma.like.create({
        data: {
          userId: userId,
          tweetId: tweetId,
        },
      });
    }
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Error toggling like:', error);
    return { success: false, error: 'Something went wrong' };
  }
}
