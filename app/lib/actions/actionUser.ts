'use server';

import prisma from '../prisma';

export async function getUser({ userName }: { userName: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        userName: userName.toLowerCase(),
      },
      include: {
      _count: {
        select: {
          tweets: true,
          followers: true,
          following: true,
        },
      },
    },
    });
    return user;
  } catch (e) {
    console.error('Error fetching user:', e);
  }
}
