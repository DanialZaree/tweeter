'use server';

import prisma from '../prisma';
import { revalidatePath } from 'next/cache';

export async function followUser(userId: string, followerId: string) {
  try {
    const existingFollow = await prisma.follower.findFirst({
      where: {
        userId: userId,
        followerId: followerId,
      },
    });
    const isCurrentlyFollowing = !!existingFollow;
    if (existingFollow) {
      await prisma.follower.deleteMany({
        where: {
          userId: userId,
          followerId: followerId,
        },
      });
    } else {
      await prisma.follower.create({
        data: {
          userId: userId,
          followerId: followerId,
        },
      });
    }
    revalidatePath('/', 'layout');
    return { success: true, followerId: followerId , isFollowing: !isCurrentlyFollowing };
  } catch (e) {
    console.error('Error following user:', e);
  }
}
