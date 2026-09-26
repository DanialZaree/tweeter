'use client';

import { useMemo } from 'react';
import { calculateXP, getLevelFromXP, getTier, getProgressStats, Tier } from '@/app/lib/tiers';
import { TIER_ICON_COMPONENTS } from '../TierIcons';

interface ProfileStatusCardProps {
  level?: number;
  totalXP?: number;
  tweetsCount?: number;
  likesCount?: number;
  rank?: number;
  tier?: Tier;
}

export default function ProfileStatusCard({
  level: propLevel,
  totalXP: propTotalXP,
  tweetsCount = 0,
  likesCount = 0,
  rank = 1,
  tier: propTier,
}: ProfileStatusCardProps) {
  const stats = useMemo(() => {
    const totalXP = propTotalXP ?? calculateXP(tweetsCount, likesCount);
    const level = propLevel ?? getLevelFromXP(totalXP);
    const tier = propTier ?? getTier(level);
    const progress = getProgressStats(level, totalXP);

    return {
      level,
      totalXP,
      tweets: tweetsCount,
      likes: likesCount,
      tier,
      ...progress,
    };
  }, [propLevel, propTotalXP, tweetsCount, likesCount, propTier]);

  const currentTier = stats.tier;
  const IconComponent =
    TIER_ICON_COMPONENTS[currentTier.iconType] || TIER_ICON_COMPONENTS['chess-queen'];
  const isMaxLevel = stats.level >= 45;
  const nextLevel = isMaxLevel ? 'MAX' : `Lvl ${stats.level + 1}`;

  return (
    <div className="relative select-none overflow-hidden rounded-2xl p-3 sm:p-4 pl-4.5 sm:pl-5 rtl:pl-3 rtl:sm:pl-4 rtl:pr-4.5 rtl:sm:pr-5 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.06)] bg-surface/30 border border-white/10">
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 rtl:left-auto rtl:right-0 rounded-l-2xl rtl:rounded-l-none rtl:rounded-r-2xl transition-colors duration-300"
        style={{
          backgroundColor: currentTier.color,
        }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300"
            style={{
              backgroundColor: `${currentTier.color}15`,
            }}
          >
            <IconComponent
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors duration-300"
              style={{ color: currentTier.color }}
            />
          </div>
          <span
            className="text-sm sm:text-base font-bold tracking-tight transition-colors duration-300"
            style={{ color: currentTier.color }}
          >
            {currentTier.name}
          </span>
        </div>

        <div className="px-2.5 py-0.5 sm:py-1 rounded-xl flex items-center justify-center bg-white/5 border border-white/5">
          <span
            className="font-extrabold text-xs sm:text-sm tracking-tight transition-colors duration-300"
            style={{ color: currentTier.color }}
          >
            #{rank}
          </span>
        </div>
      </div>

      <div className="mt-2.5 sm:mt-3">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium px-0.5">
          <span className="font-semibold text-white/70">Level {stats.level}</span>
          <span className="text-white/50">
            {stats.currentXP} / {stats.nextLevelXP} XP
          </span>
          <span className="text-white/50">{nextLevel}</span>
        </div>

        <div className="w-full h-1.5 sm:h-2 rounded-full bg-[#f1f5f9] overflow-hidden relative mt-1.5">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${stats.percent}%`,
              backgroundColor: currentTier.color,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-white/5 text-center">
        <div className="flex flex-col items-center">
          <span className="text-sm sm:text-base font-extrabold tracking-tight">
            {stats.level}
          </span>
          <span className="text-[10px] sm:text-xs text-white/50 font-medium">
            Level
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-sm sm:text-base font-extrabold tracking-tight">
            {stats.totalXP}
          </span>
          <span className="text-[10px] sm:text-xs text-white/50 font-medium">
            Total XP
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-sm sm:text-base font-extrabold tracking-tight">
            {stats.tweets}
          </span>
          <span className="text-[10px] sm:text-xs text-white/50 font-medium">
            Tweets
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-sm sm:text-base font-extrabold tracking-tight">
            {stats.likes}
          </span>
          <span className="text-[10px] sm:text-xs text-white/50 font-medium">
            Likes
          </span>
        </div>
      </div>
    </div>
  );
}
