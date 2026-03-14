import { create } from 'zustand';
import { GoalScope } from '@/types';

// goalsStore only manages UI state (scope filter).
// All server data is fetched via TanStack Query hooks in src/hooks/useGoals.ts
interface GoalsUIState {
  activeScope: GoalScope | 'all';
  setActiveScope: (scope: GoalScope | 'all') => void;
}

export const useGoalsStore = create<GoalsUIState>((set) => ({
  activeScope: 'all',
  setActiveScope: (scope) => set({ activeScope: scope }),
}));
