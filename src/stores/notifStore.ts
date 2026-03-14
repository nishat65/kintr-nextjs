// Notifications are now managed by TanStack Query hooks in src/hooks/useNotifications.ts
// This store only holds UI state (panel open/close).
import { create } from 'zustand';

interface NotifUIState {
  isPanelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
}

export const useNotifStore = create<NotifUIState>((set) => ({
  isPanelOpen: false,
  setPanelOpen: (open) => set({ isPanelOpen: open }),
}));
