'use server';

import prisma from '../prisma';

export type FollowListUser = {
  id: string;
  name: string | null;
  userName: string | null;
  avatar: string | null;
  bio: string | null;
};

export async function getFollowList(
  userId: string,
  type: 'followers' | 'following',
): Promise<FollowListUser[]> {
  if (!userId) return [];

  try {
    if (type === 'followers') {
      const records = await prisma.follower.findMany({
        where: { followerId: userId },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              userName: true,
              avatar: true,
              bio: true,
            },
          },
        },
        orderBy: { id: 'desc' },
        take: 200,
      });
      return records.map((r) => r.user);
    } else {
      const records = await prisma.follower.findMany({
        where: { userId },
        select: {
          follower: {
            select: {
              id: true,
              name: true,
              userName: true,
              avatar: true,
              bio: true,
            },
          },
        },
        orderBy: { id: 'desc' },
        take: 200,
      });
      return records.map((r) => r.follower);
    }
  } catch (e) {
    console.error('Error fetching follow list:', e);
    return [];
  }
}
