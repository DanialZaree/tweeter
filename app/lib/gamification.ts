import prisma from './prisma';
import { calculateXP, getLevelFromXP, getTier, getProgressStats, Tier } from './tiers';

export interface UserGamificationStats {
  tweetsCount: number;
  likesCount: number;
  totalXP: number;
  level: number;
  tier: Tier;
  rank: number;
  currentXP: number;
  nextLevelXP: number;
  percent: number;
}

/**
 * Fetch gamification stats for a user.
 * Reads stored XP and Level directly from DB (O(1)), with indexed rank lookup.
 */
export async function getUserGamification(
  userId: string,
  preloaded?: { xp?: number; level?: number; tweetsCount?: number }
): Promise<UserGamificationStats> {
  if (!userId) {
    const tier = getTier(0);
    const progress = getProgressStats(0, 0);
    return {
      tweetsCount: 0,
      likesCount: 0,
      totalXP: 0,
      level: 0,
      tier,
      rank: 1,
      ...progress,
    };
  }

  let xp = preloaded?.xp;
  let level = preloaded?.level;
  let tweetsCount = preloaded?.tweetsCount;

  if (xp === undefined || level === undefined || tweetsCount === undefined) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        level: true,
        _count: { select: { tweets: true } },
      },
    });
    xp = user?.xp ?? 0;
    level = user?.level ?? getLevelFromXP(xp);
    tweetsCount = user?._count?.tweets ?? 0;
  }

  const tier = getTier(level);
  const progress = getProgressStats(level, xp);
  const likesCount = Math.max(0, Math.floor((xp - tweetsCount * 10) / 5));

  // Single fast indexed query: count users with higher XP
  const higherUsers = await prisma.user.count({
    where: { xp: { gt: xp } },
  });
  const rank = higherUsers + 1;

  return {
    tweetsCount,
    likesCount,
    totalXP: xp,
    level,
    tier,
    rank,
    ...progress,
  };
}

/**
 * Synchronize and persist user XP & level in DB.
 * Called only upon actions (tweet create/delete, like/unlike).
 */
export async function syncUserGamification(
  userId: string
): Promise<{ xp: number; level: number } | null> {
  if (!userId) return null;
  try {
    const [tweetsCount, likesCount] = await Promise.all([
      prisma.tweet.count({ where: { authorId: userId } }),
      prisma.like.count({ where: { tweet: { authorId: userId } } }),
    ]);

    const xp = calculateXP(tweetsCount, likesCount);
    const level = getLevelFromXP(xp);

    await prisma.user.update({
      where: { id: userId },
      data: { xp, level },
    });

    return { xp, level };
  } catch (error) {
    console.error(`Failed to sync gamification for user ${userId}:`, error);
    return null;
  }
}

export async function attachAuthorLevels<T>(tweets: T[]): Promise<T[]> {
  return tweets;
}

export async function attachSingleTweetAuthorLevels<T>(tweet: T): Promise<T> {
  return tweet;
}
