import { z } from 'zod';

export const startQuizSchema = z.object({
  amount: z.number().int().min(1).max(50),
  categoryId: z.number().int().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  type: z.enum(['multiple', 'boolean']).optional(),
  timeLimit: z.number().int().min(30).max(3600), // 30 seconds to 1 hour
});

export const submitAnswerSchema = z.object({
  sessionId: z.uuid(),
  questionIndex: z.number().int().min(0),
  questionId: z.string(),
  selectedAnswer: z.string(),
});

const userAnswerSchema = z.object({
  questionIndex: z.number().int(),
  questionId: z.string(),
  selectedAnswer: z.string(),
  correctAnswer: z.string(),
  isCorrect: z.boolean(),
  answeredAt: z.string(),
});

export const syncSessionSchema = z.object({
  sessionId: z.uuid(),
  currentQuestionIndex: z.number().int().min(0),
  timeRemaining: z.number().int().min(0),
  userAnswers: z.array(userAnswerSchema),
  clientUpdatedAt: z.string().datetime().optional(),
});

export const completeQuizSchema = z.object({
  sessionId: z.uuid(),
  reason: z.enum(['finished', 'timeout', 'abandoned']),
  timeRemaining: z.number().int().min(0),
});

export const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});
