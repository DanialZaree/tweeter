import { create } from 'zustand';

interface Drawerstate {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useDrawerStore = create<Drawerstate>((set) => ({
  isOpen: true,
  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
}));
