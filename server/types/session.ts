import { QuizQuestion, UserAnswer, QuizDifficulty, QuizType } from './question';

export type QuizSessionStatus = 'in_progress' | 'completed' | 'timeout' | 'abandoned';
export type CompletionReason = 'finished' | 'timeout' | 'abandoned';

export interface StartQuizRequest {
  amount: number;
  categoryId?: number;
  difficulty?: QuizDifficulty;
  type?: QuizType;
  timeLimit: number;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionIndex: number;
  questionId: string;
  selectedAnswer: string;
}

export interface SyncSessionRequest {
  sessionId: string;
  currentQuestionIndex: number;
  timeRemaining: number;
  userAnswers: UserAnswer[];
  clientUpdatedAt?: string;
}

export interface CompleteQuizRequest {
  sessionId: string;
  reason: CompletionReason;
  timeRemaining: number;
}

export interface CreateSessionResult {
  success: boolean;
  session?: {
    id: string;
    questions: QuizQuestion[];
    totalQuestions: number;
    timeLimit: number;
    category: string | null;
    difficulty: string | null;
    questionType: string | null;
  };
  error?: string;
}

export interface SessionData {
  id: string;
  userId: string;
  totalQuestions: number;
  category: string | null;
  categoryId: number | null;
  difficulty: string | null;
  questionType: string | null;
  currentQuestionIndex: number;
  answeredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeLimit: number;
  timeRemaining: number;
  questions: QuizQuestion[];
  userAnswers: UserAnswer[];
  status: string;
  expiresAt: Date;
  startedAt: Date;
}

export interface SubmitAnswerResult {
  success: boolean;
  isCorrect: boolean;
  error?: string;
}

export interface SyncSessionResult {
  success: boolean;
  error?: string;
  serverUpdatedAt?: string;
}

export interface CompleteSessionResult {
  success: boolean;
  resultId?: string;
  error?: string;
}
