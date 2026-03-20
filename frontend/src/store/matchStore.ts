import { create } from 'zustand';

interface Match {
  _id: string;
  users: any[];
  isBlind: boolean;
  isRevealed: boolean;
  messageCount: number;
  revealThreshold: number;
  otherUser: any;
}

interface MatchState {
  matches: Match[];
  blindMatches: Match[];
  currentMatch: Match | null;
  setMatches: (matches: Match[]) => void;
  setBlindMatches: (matches: Match[]) => void;
  setCurrentMatch: (match: Match | null) => void;
  addMatch: (match: Match) => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  matches: [],
  blindMatches: [],
  currentMatch: null,

  setMatches: (matches) => set({ matches }),
  setBlindMatches: (matches) => set({ blindMatches: matches }),
  setCurrentMatch: (match) => set({ currentMatch: match }),
  addMatch: (match) =>
    set((state) => ({
      matches: [match, ...state.matches],
    })),
}));
