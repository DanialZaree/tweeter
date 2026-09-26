import { TierIconType } from '../components/TierIcons';

export type TierName =
  | 'Starter'
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Master'
  | 'Grandmaster'
  | 'Epic'
  | 'Legend';

export type Tier = {
  name: TierName;
  minLevel: number;
  maxLevel: number;
  color: string;
  iconType: TierIconType;
};

export const TIERS: Tier[] = [
  {
    name: 'Starter',
    minLevel: 0,
    maxLevel: 4,
    color: '#94a3b8',
    iconType: 'split-diamond',
  },
  {
    name: 'Bronze',
    minLevel: 5,
    maxLevel: 9,
    color: '#cd7f32',
    iconType: 'tetrahedron',
  },
  {
    name: 'Silver',
    minLevel: 10,
    maxLevel: 14,
    color: '#cbd5e1',
    iconType: 'd8',
  },
  {
    name: 'Gold',
    minLevel: 15,
    maxLevel: 19,
    color: '#eab308',
    iconType: 'd20',
  },
  {
    name: 'Platinum',
    minLevel: 20,
    maxLevel: 24,
    color: '#14b8a6',
    iconType: 'orbit-2',
  },
  {
    name: 'Diamond',
    minLevel: 25,
    maxLevel: 29,
    color: '#0ea5e9',
    iconType: 'orbit-3',
  },
  {
    name: 'Master',
    minLevel: 30,
    maxLevel: 34,
    color: '#a855f7',
    iconType: 'scarab',
  },
  {
    name: 'Grandmaster',
    minLevel: 35,
    maxLevel: 39,
    color: '#ef4444',
    iconType: 'flame',
  },
  {
    name: 'Epic',
    minLevel: 40,
    maxLevel: 44,
    color: '#f97316',
    iconType: 'checkerboard',
  },
  {
    name: 'Legend',
    minLevel: 45,
    maxLevel: 45,
    color: '#f43f5e',
    iconType: 'chess-queen',
  },
];

export function getTier(level: number): Tier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (level >= TIERS[i].minLevel) return TIERS[i];
  }
  return TIERS[0];
}

export function calculateXP(tweets: number, likes: number): number {
  return tweets * 10 + likes * 5;
}

export function getLevelFromXP(xp: number): number {
  if (xp < 20) return 0;
  const level = Math.floor((xp - 20) / 22.7) + 1;
  return Math.min(Math.max(level, 0), 45);
}

export function getXPForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level >= 45) return 1020;
  return Math.round(20 + (level - 1) * 22.7);
}

export function getProgressStats(level: number, xp?: number) {
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = level >= 45 ? 1020 : getXPForLevel(level + 1);
  const actualXP = xp !== undefined ? xp : (level >= 45 ? 1018 : currentLevelXP);

  let percent = 100;
  if (level < 45) {
    const range = nextLevelXP - currentLevelXP;
    const gained = Math.max(0, actualXP - currentLevelXP);
    percent = range > 0 ? Math.min(100, Math.round((gained / range) * 100)) : 100;
  } else {
    percent = 100;
  }

  return {
    currentXP: actualXP,
    nextLevelXP,
    percent,
  };
}

export function getAuthorTier(author?: {
  id?: string;
  userName?: string | null;
  level?: number;
  tweetsCount?: number;
  likesCount?: number;
  _count?: {
    tweets?: number;
  };
}): Tier {
  if (author?.level !== undefined) {
    return getTier(author.level);
  }
  const tweets = author?.tweetsCount ?? author?._count?.tweets;
  if (tweets !== undefined) {
    const xp = calculateXP(tweets, author?.likesCount ?? 0);
    return getTier(getLevelFromXP(xp));
  }
  return TIERS[0];
}
