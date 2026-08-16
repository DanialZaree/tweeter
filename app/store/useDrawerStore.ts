import { create } from 'zustand';

interface Drawerstate {
  isOpen: boolean;
  retweetOfId: string | null;
  openDrawer: (retweetOfId?: string) => void;
  closeDrawer: () => void;
}

export const useDrawerStore = create<Drawerstate>((set) => ({
  isOpen: false,
  retweetOfId: null,
  openDrawer: (retweetOfId) => set({ isOpen: true, retweetOfId: retweetOfId ?? null }),
  closeDrawer: () => set({ isOpen: false }),
}));
