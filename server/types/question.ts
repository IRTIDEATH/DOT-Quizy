export type QuizDifficulty = 'easy' | 'medium' | 'hard';
export type QuizType = 'multiple' | 'boolean';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: QuizDifficulty;
  type: QuizType;
}

export interface UserAnswer {
  questionIndex: number;
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  answeredAt: string; // ISO date string
}
