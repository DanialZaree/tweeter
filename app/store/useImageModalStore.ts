import { create } from 'zustand';

interface ImageModalState {
  src: string | null;
  open: (src: string) => void;
  close: () => void;
}

export const useImageModalStore = create<ImageModalState>((set) => ({
  src: null,
  open: (src) => set({ src }),
  close: () => set({ src: null }),
}));
