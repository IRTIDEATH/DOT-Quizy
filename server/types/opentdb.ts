import { QuizQuestion, QuizDifficulty, QuizType } from './question';

export interface OpenTDBCategory {
  id: number;
  name: string;
}

export interface OpenTDBCategoriesResponse {
  trivia_categories: OpenTDBCategory[];
}

export interface OpenTDBQuestion {
  category: string;
  type: QuizType;
  difficulty: QuizDifficulty;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface OpenTDBResponse {
  response_code: number;
  results: OpenTDBQuestion[];
}

export const OPENTDB_RESPONSE_CODES = {
  SUCCESS: 0,
  NO_RESULTS: 1,
  INVALID_PARAMETER: 2,
  TOKEN_NOT_FOUND: 3,
  TOKEN_EMPTY: 4,
  RATE_LIMIT: 5,
} as const;

export interface FetchQuestionsParams {
  amount: number;
  category?: number;
  difficulty?: QuizDifficulty;
  type?: QuizType;
}

export interface FetchQuestionsResult {
  success: boolean;
  questions: QuizQuestion[];
  error?: string;
  responseCode?: number;
}

export interface QuizConfig {
  amount: number;
  category?: number;
  difficulty?: QuizDifficulty;
  type?: QuizType;
  timeLimit: number; // in seconds
}
