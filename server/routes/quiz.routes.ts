import { Hono } from 'hono';
import { z } from 'zod';
import { requireAuth, AuthContext } from '../middleware/auth.middleware';
import { fetchCategories } from '../services/opentdb.service';
import {
  createQuizSession,
  getQuizSession,
  getActiveSession,
  submitAnswer,
  syncSession,
  completeQuizSession,
  getQuizHistory,
  getQuizResult,
} from '../services/quiz.service';
import {
  startQuizSchema,
  submitAnswerSchema,
  syncSessionSchema,
  completeQuizSchema,
  historyQuerySchema,
} from '../validations/quiz';

const quiz = new Hono<AuthContext>();

quiz.use('*', requireAuth);

quiz.get('/categories', async (c) => {
  try {
    const data = await fetchCategories();
    return c.json({
      success: true,
      categories: data.trivia_categories,
    });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch categories',
    }, 500);
  }
});

quiz.post('/start', async (c) => {
  const user = c.get('user')!;
  
  const body = await c.req.json();
  const validation = startQuizSchema.safeParse(body);
  
  if (!validation.success) {
    return c.json({
      success: false,
      error: 'Invalid request',
      details: z.flattenError(validation.error),
    }, 400);
  }

  const result = await createQuizSession(user.id, validation.data);

  if (!result.success) {
    return c.json({
      success: false,
      error: result.error,
    }, 400);
  }

  return c.json({
    success: true,
    session: result.session,
  });
});

quiz.get('/session/:id', async (c) => {
  const user = c.get('user')!;
  const sessionId = c.req.param('id');

  const session = await getQuizSession(sessionId, user.id);

  if (!session) {
    return c.json({
      success: false,
      error: 'Session not found',
    }, 404);
  }

  return c.json({
    success: true,
    session,
  });
});

quiz.post('/answer', async (c) => {
  const user = c.get('user')!;
  
  const body = await c.req.json();
  const validation = submitAnswerSchema.safeParse(body);

  if (!validation.success) {
    return c.json({
      success: false,
      error: 'Invalid request',
      details: z.flattenError(validation.error),
    }, 400);
  }

  const { sessionId, questionIndex, questionId, selectedAnswer } = validation.data;

  const result = await submitAnswer(
    sessionId,
    user.id,
    questionIndex,
    questionId,
    selectedAnswer
  );

  if (!result.success) {
    return c.json({
      success: false,
      error: result.error,
    }, 400);
  }

  return c.json({
    success: true,
    isCorrect: result.isCorrect,
  });
});

quiz.patch('/sync', async (c) => {
  const user = c.get('user')!;
  
  const body = await c.req.json();
  const validation = syncSessionSchema.safeParse(body);

  if (!validation.success) {
    return c.json({
      success: false,
      error: 'Invalid request',
      details: z.flattenError(validation.error),
    }, 400);
  }

  const { sessionId, currentQuestionIndex, timeRemaining, userAnswers, clientUpdatedAt } = validation.data;

  const result = await syncSession(
    sessionId,
    user.id,
    currentQuestionIndex,
    timeRemaining,
    userAnswers,
    clientUpdatedAt
  );

  if (!result.success) {
    return c.json({
      success: false,
      error: result.error,
      serverUpdatedAt: result.serverUpdatedAt,
    }, 409); // 409 Conflict for stale data
  }

  return c.json({ success: true });
});

quiz.get('/resume', async (c) => {
  const user = c.get('user')!;

  const session = await getActiveSession(user.id);

  if (!session) {
    return c.json({
      success: true,
      hasActiveSession: false,
      session: null,
    });
  }

  return c.json({
    success: true,
    hasActiveSession: true,
    session: {
      id: session.id,
      totalQuestions: session.totalQuestions,
      answeredQuestions: session.answeredQuestions,
      currentQuestionIndex: session.currentQuestionIndex,
      timeRemaining: session.timeRemaining,
      category: session.category,
      difficulty: session.difficulty,
      expiresAt: session.expiresAt.toISOString(),
    },
  });
});

quiz.post('/complete', async (c) => {
  const user = c.get('user')!;
  
  const body = await c.req.json();
  const validation = completeQuizSchema.safeParse(body);

  if (!validation.success) {
    return c.json({
      success: false,
      error: 'Invalid request',
      details: z.flattenError(validation.error),
    }, 400);
  }

  const { sessionId, reason, timeRemaining } = validation.data;

  const result = await completeQuizSession(
    sessionId,
    user.id,
    reason,
    timeRemaining
  );

  if (!result.success) {
    return c.json({
      success: false,
      error: result.error,
    }, 400);
  }

  return c.json({
    success: true,
    resultId: result.resultId,
  });
});

quiz.get('/history', async (c) => {
  const user = c.get('user')!;
  
  const query = c.req.query();
  const validation = historyQuerySchema.safeParse(query);

  if (!validation.success) {
    return c.json({
      success: false,
      error: 'Invalid query parameters',
      details: z.flattenError(validation.error),
    }, 400);
  }

  const { limit, offset } = validation.data;

  const { results, total } = await getQuizHistory(user.id, limit, offset);

  return c.json({
    success: true,
    results,
    pagination: {
      limit,
      offset,
      total,
      hasMore: offset + results.length < total,
    },
  });
});

quiz.get('/result/:id', async (c) => {
  const user = c.get('user')!;
  const resultId = c.req.param('id');

  const result = await getQuizResult(resultId, user.id);

  if (!result) {
    return c.json({
      success: false,
      error: 'Result not found',
    }, 404);
  }

  const session = await getQuizSession(result.sessionId, user.id);

  return c.json({
    success: true,
    result,
    session: session ? {
      questions: session.questions,
      userAnswers: session.userAnswers,
    } : null,
  });
});

export default quiz;
