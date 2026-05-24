import { create } from 'zustand';

interface LimitState {
  character: number;
  updateChar: (charNumber: number) => void;
}

export const useCharLimitStore = create<LimitState>((set) => ({
  character: 0,
  updateChar: (charNumber) => set({ character: charNumber }),
}));
