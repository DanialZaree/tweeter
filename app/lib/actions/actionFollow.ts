'use server';

import { auth } from '@/app/auth';
import prisma from '../prisma';
import { revalidatePath } from 'next/cache';

export async function followUser(userId: string, followerId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }
  const currentUserId = session.user.id;

  
  try {
    const existingFollow = await prisma.follower.findFirst({
      where: {
        userId: userId,
        followerId: currentUserId,
      },
    });
    const isCurrentlyFollowing = !!existingFollow;
    if (existingFollow) {
      await prisma.follower.deleteMany({
        where: {
          userId: userId,
          followerId: currentUserId,
        },
      });
    } else {
      await prisma.follower.create({
        data: {
          userId: userId,
          followerId: currentUserId,
        },
      });
    }
    revalidatePath('/', 'layout');
    return { success: true, followerId: currentUserId , isFollowing: !isCurrentlyFollowing };
  } catch (e) {
    console.error('Error following user:', e);
  }
}
