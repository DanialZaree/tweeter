import { create } from 'zustand';
import { TIERS, Tier, getTier } from '../lib/tiers';

interface GamificationState {
  tierIndex: number;
  level: number;
  setTierIndex: (index: number) => void;
  setLevel: (level: number) => void;
  getCurrentTier: () => Tier;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  tierIndex: 0,
  level: 0,
  setTierIndex: (index: number) => {
    const safeIndex = Math.max(0, Math.min(index, TIERS.length - 1));
    set({
      tierIndex: safeIndex,
      level: TIERS[safeIndex].minLevel,
    });
  },
  setLevel: (level: number) => {
    const tier = getTier(level);
    const index = TIERS.findIndex((t) => t.name === tier.name);
    set({
      level,
      tierIndex: index >= 0 ? index : 0,
    });
  },
  getCurrentTier: () => {
    return TIERS[get().tierIndex] ?? TIERS[0];
  },
}));
