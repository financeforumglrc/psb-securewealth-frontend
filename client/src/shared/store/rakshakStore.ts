import { create } from 'zustand';

export type RakshakOutcome = 'SAFE' | 'SOS' | 'SUPPORT' | null;

export interface RakshakData {
  message: string;
  quickReplies: string[];
  riskScore: number;
  pendingTransaction: Record<string, any> | null;
}

interface RakshakState {
  isRakshakActive: boolean;
  rakshakData: RakshakData | null;
  outcome: RakshakOutcome;

  triggerRakshak: (data: Omit<RakshakData, 'pendingTransaction'> & { pendingTransaction?: Record<string, any> | null }) => void;
  resolveRakshak: (outcome: Exclude<RakshakOutcome, null>) => void;
  resetRakshak: () => void;
}

export const useRakshakStore = create<RakshakState>((set) => ({
  isRakshakActive: false,
  rakshakData: null,
  outcome: null,

  triggerRakshak: (data) =>
    set({
      isRakshakActive: true,
      rakshakData: {
        message: data.message,
        quickReplies: data.quickReplies,
        riskScore: data.riskScore,
        pendingTransaction: data.pendingTransaction ?? null,
      },
      outcome: null,
    }),

  resolveRakshak: (outcome) =>
    set({
      isRakshakActive: false,
      outcome,
    }),

  resetRakshak: () =>
    set({
      isRakshakActive: false,
      rakshakData: null,
      outcome: null,
    }),
}));
