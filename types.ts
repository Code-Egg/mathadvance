export type OperationType = 
  | 'ADD' 
  | 'SUBTRACT' 
  | 'MULTIPLY' 
  | 'DIVIDE' 
  | 'QUADRATIC_BASIC' 
  | 'QUADRATIC_ADVANCED' 
  | 'TRIGONOMETRY'
  | 'CALCULUS';

export interface Question {
  id: string;
  type: OperationType;
  displayText: string;
  correctAnswer: number;
  options: number[];
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'HELL';

export type GameState = 'START' | 'PLAYING' | 'FINISHED';

export interface GameStats {
  score: number;
  totalQuestions: number;
  history: boolean[]; // true for correct, false for incorrect
}