'use server';

import prisma from '../prisma';

const safeUserSelect = {
  id: true,
  name: true,
  userName: true,
  avatar: true,
  coverImage: true,
  bio: true,
  job: true,
  createdAt: true,
};

export async function getUser({ userName }: { userName: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        userName: userName.toLowerCase(),
      },
      select: {
        ...safeUserSelect,
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
