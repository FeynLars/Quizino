export type Phase =
  | 'start'
  | 'opening'
  | 'question'
  | 'hint1'
  | 'hint2'
  | 'hint3'
  | 'reveal'
  | 'elimination';

export interface Player {
  uid: string;
  name: string;
  score: number;
  quizinos: number;
  currentBet?: number;
  currentAnswer?: string;
  hasFolded?: boolean;
  isAllIn?: boolean;
  isReady?: boolean;
}

export interface Game {
  id: string;
  lobbyId: string;
  status: 'waiting' | 'playing';
  phase: Phase;
  currentRound: number;
  players: Player[];
  currentPlayerIndex: number;
  pot: number;
  smallBlind: number;
  bigBlind: number;
  blindLevel: number;
  currentHintIndex: number;
  createdAt: number;
  lastBlindIncrease: number;
  roundStartTime: number;
  selectedCategory?: string | null;
  currentQuestion?: string | null;
  currentAnswer?: string;
  currentHints?: string[];
  currentQuestionType?: 'text' | 'number';
}

export interface Question {
  id: string;
  category: string;
  question: string;
  answer: string;
  hints: string[];
  type: 'text' | 'number';
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

