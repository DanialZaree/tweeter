'use server';

import prisma from '../prisma';
import { revalidatePath } from 'next/cache';

export async function toggleTweetLike(tweetId: string, userId: string) {
  try {
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
        where: { id: existingLike.id },
      });
    } else {
      await prisma.like.create({
        data: {
          userId: userId,
          tweetId: tweetId,
        },
      });
    }
    revalidatePath('/feed');
    return { success: true };
  } catch (error) {
    console.error("Error toggling like:", error);
    return { success: false, error: "Something went wrong" };
  }
}
