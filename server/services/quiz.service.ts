import { eq, and, desc, count, sql } from 'drizzle-orm';
import { db } from '../database/db';
import { quizSession, quizResult } from '../database/schema';
import { QuizQuestion, UserAnswer } from '../types/question';
import { 
  StartQuizRequest,
  CompletionReason,
  QuizSessionStatus,
  CreateSessionResult,
  SessionData,
  SubmitAnswerResult,
  SyncSessionResult,
  CompleteSessionResult,
} from '../types/session';
import { fetchQuestions, getCategoryNameById } from './opentdb.service';

const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function createQuizSession(
  userId: string,
  params: StartQuizRequest
): Promise<CreateSessionResult> {
  const questionsResult = await fetchQuestions({
    amount: params.amount,
    category: params.categoryId,
    difficulty: params.difficulty,
    type: params.type,
  });

  if (!questionsResult.success) {
    return {
      success: false,
      error: questionsResult.error || 'Failed to fetch questions',
    };
  }

  let categoryName: string | null = null;
  if (params.categoryId) {
    categoryName = await getCategoryNameById(params.categoryId);
  }

  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);

  const session = await db.transaction(async (tx) => {
    // prevent concurrent session creation
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${userId}::text))`);

    await tx.update(quizSession)
      .set({ status: 'abandoned' })
      .where(and(
        eq(quizSession.userId, userId),
        eq(quizSession.status, 'in_progress')
      ));

    // Create new session
    const [newSession] = await tx.insert(quizSession).values({
      userId,
      totalQuestions: questionsResult.questions.length,
      category: categoryName,
      categoryId: params.categoryId ?? null,
      difficulty: params.difficulty ?? null,
      questionType: params.type ?? null,
      timeLimit: params.timeLimit,
      timeRemaining: params.timeLimit,
      questions: questionsResult.questions,
      userAnswers: [],
      status: 'in_progress',
      expiresAt,
    }).returning();

    return newSession;
  });

  return {
    success: true,
    session: {
      id: session.id,
      questions: questionsResult.questions,
      totalQuestions: questionsResult.questions.length,
      timeLimit: params.timeLimit,
      category: categoryName,
      difficulty: params.difficulty ?? null,
      questionType: params.type ?? null,
    },
  };
}

export async function getQuizSession(
  sessionId: string,
  userId: string
): Promise<SessionData | null> {
  const [session] = await db
    .select()
    .from(quizSession)
    .where(and(
      eq(quizSession.id, sessionId),
      eq(quizSession.userId, userId)
    ));

  if (!session) {
    return null;
  }

  return {
    id: session.id,
    userId: session.userId,
    totalQuestions: session.totalQuestions,
    category: session.category,
    categoryId: session.categoryId,
    difficulty: session.difficulty,
    questionType: session.questionType,
    currentQuestionIndex: session.currentQuestionIndex,
    answeredQuestions: session.answeredQuestions,
    correctAnswers: session.correctAnswers,
    wrongAnswers: session.wrongAnswers,
    timeLimit: session.timeLimit,
    timeRemaining: session.timeRemaining,
    questions: session.questions as QuizQuestion[],
    userAnswers: session.userAnswers as UserAnswer[],
    status: session.status,
    expiresAt: session.expiresAt,
    startedAt: session.startedAt,
  };
}

export async function getActiveSession(userId: string): Promise<SessionData | null> {
  const [session] = await db
    .select()
    .from(quizSession)
    .where(and(
      eq(quizSession.userId, userId),
      eq(quizSession.status, 'in_progress')
    ))
    .orderBy(desc(quizSession.createdAt))
    .limit(1);

  if (!session) {
    return null;
  }

  if (new Date() > session.expiresAt) {
    await db.update(quizSession)
      .set({ status: 'abandoned' })
      .where(eq(quizSession.id, session.id));
    return null;
  }

  return {
    id: session.id,
    userId: session.userId,
    totalQuestions: session.totalQuestions,
    category: session.category,
    categoryId: session.categoryId,
    difficulty: session.difficulty,
    questionType: session.questionType,
    currentQuestionIndex: session.currentQuestionIndex,
    answeredQuestions: session.answeredQuestions,
    correctAnswers: session.correctAnswers,
    wrongAnswers: session.wrongAnswers,
    timeLimit: session.timeLimit,
    timeRemaining: session.timeRemaining,
    questions: session.questions as QuizQuestion[],
    userAnswers: session.userAnswers as UserAnswer[],
    status: session.status,
    expiresAt: session.expiresAt,
    startedAt: session.startedAt,
  };
}

export async function submitAnswer(
  sessionId: string,
  userId: string,
  questionIndex: number,
  questionId: string,
  selectedAnswer: string
): Promise<SubmitAnswerResult> {
  return await db.transaction(async (tx) => {
    const [session] = await tx
      .select()
      .from(quizSession)
      .where(and(
        eq(quizSession.id, sessionId),
        eq(quizSession.userId, userId)
      ))
      .for('update');

    if (!session) {
      return { success: false, isCorrect: false, error: 'Session not found' };
    }

    if (session.status !== 'in_progress') {
      return { success: false, isCorrect: false, error: 'Session is not active' };
    }

    const userAnswers = session.userAnswers as UserAnswer[];
    const questions = session.questions as QuizQuestion[];

    const alreadyAnswered = userAnswers.some(
      a => a.questionIndex === questionIndex
    );

    if (alreadyAnswered) {
      return { success: false, isCorrect: false, error: 'Question already answered' };
    }

    const question = questions.find(q => q.id === questionId);
    if (!question) {
      return { success: false, isCorrect: false, error: 'Question not found' };
    }

    const isCorrect = selectedAnswer === question.correctAnswer;

    const newAnswer: UserAnswer = {
      questionIndex,
      questionId,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      answeredAt: new Date().toISOString(),
    };

    const updatedAnswers = [...userAnswers, newAnswer];

    await tx.update(quizSession)
      .set({
        userAnswers: updatedAnswers,
        answeredQuestions: updatedAnswers.length,
        correctAnswers: session.correctAnswers + (isCorrect ? 1 : 0),
        wrongAnswers: session.wrongAnswers + (isCorrect ? 0 : 1),
        currentQuestionIndex: Math.min(questionIndex + 1, session.totalQuestions - 1),
      })
      .where(eq(quizSession.id, sessionId));

    return { success: true, isCorrect };
  });
}

export async function syncSession(
  sessionId: string,
  userId: string,
  currentQuestionIndex: number,
  timeRemaining: number,
  userAnswers: UserAnswer[],
  clientUpdatedAt?: string
): Promise<SyncSessionResult> {
  return await db.transaction(async (tx) => {
    const [session] = await tx
      .select()
      .from(quizSession)
      .where(and(
        eq(quizSession.id, sessionId),
        eq(quizSession.userId, userId)
      ))
      .for('update');

    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (session.status !== 'in_progress') {
      return { success: false, error: 'Session is not active' };
    }

    if (clientUpdatedAt) {
      const clientTime = new Date(clientUpdatedAt).getTime();
      const serverTime = new Date(session.updatedAt).getTime();
      
      if (clientTime < serverTime) {
        return { 
          success: false, 
          error: 'Sync rejected: server has newer data',
          serverUpdatedAt: session.updatedAt.toISOString(),
        };
      }
    }

    const validTimeRemaining = Math.min(timeRemaining, session.timeRemaining);

    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const wrongCount = userAnswers.filter(a => !a.isCorrect).length;

    await tx.update(quizSession)
      .set({
        currentQuestionIndex,
        timeRemaining: validTimeRemaining,
        userAnswers,
        answeredQuestions: userAnswers.length,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
      })
      .where(eq(quizSession.id, sessionId));

    return { success: true };
  });
}

export async function completeQuizSession(
  sessionId: string,
  userId: string,
  reason: CompletionReason,
  finalTimeRemaining: number
): Promise<CompleteSessionResult> {
  return await db.transaction(async (tx) => {
    const [session] = await tx
      .select()
      .from(quizSession)
      .where(and(
        eq(quizSession.id, sessionId),
        eq(quizSession.userId, userId)
      ))
      .for('update');

    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (session.status !== 'in_progress') {
      return { success: false, error: 'Session is already completed' };
    }

    const timeTaken = session.timeLimit - finalTimeRemaining;
    const skipped = session.totalQuestions - session.answeredQuestions;
    const scorePercentage = session.totalQuestions > 0
      ? Math.round((session.correctAnswers / session.totalQuestions) * 100)
      : 0;

    let status: QuizSessionStatus = 'completed';
    if (reason === 'timeout') status = 'timeout';
    if (reason === 'abandoned') status = 'abandoned';

    await tx.update(quizSession)
      .set({
        status,
        timeRemaining: finalTimeRemaining,
        completedAt: new Date(),
      })
      .where(eq(quizSession.id, sessionId));

    const [result] = await tx.insert(quizResult).values({
      userId,
      sessionId,
      category: session.category,
      difficulty: session.difficulty,
      questionType: session.questionType,
      totalQuestions: session.totalQuestions,
      answeredQuestions: session.answeredQuestions,
      correctAnswers: session.correctAnswers,
      wrongAnswers: session.wrongAnswers,
      skippedQuestions: skipped,
      timeLimitSeconds: session.timeLimit,
      timeTakenSeconds: timeTaken,
      scorePercentage,
      completionReason: reason,
    }).returning();

    return { success: true, resultId: result.id };
  });
}

export async function getQuizHistory(
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ results: typeof quizResult.$inferSelect[]; total: number }> {
  const results = await db
    .select()
    .from(quizResult)
    .where(eq(quizResult.userId, userId))
    .orderBy(desc(quizResult.completedAt))
    .limit(limit)
    .offset(offset);

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(quizResult)
    .where(eq(quizResult.userId, userId));

  return {
    results,
    total,
  };
}

export async function getQuizResult(
  resultId: string,
  userId: string
): Promise<typeof quizResult.$inferSelect | null> {
  const [result] = await db
    .select()
    .from(quizResult)
    .where(and(
      eq(quizResult.id, resultId),
      eq(quizResult.userId, userId)
    ));

  return result ?? null;
}

export async function abandonActiveSessions(userId: string): Promise<void> {
  await db.update(quizSession)
    .set({ status: 'abandoned' })
    .where(and(
      eq(quizSession.userId, userId),
      eq(quizSession.status, 'in_progress')
    ));
}
