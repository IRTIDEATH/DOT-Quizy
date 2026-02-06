import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, uuid, integer, jsonb } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text('role'),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  premium: boolean('premium'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: uuid('id').primaryKey().defaultRandom(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: uuid('id').primaryKey().defaultRandom(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: uuid('id').primaryKey().defaultRandom(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  quizSessions: many(quizSession),
  quizResults: many(quizResult),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Quiz Schema
export const quizSession = pgTable(
  "quiz_session",
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    
    totalQuestions: integer('total_questions').notNull(),
    category: text('category'),
    categoryId: integer('category_id'),
    difficulty: text('difficulty'),
    questionType: text('question_type'),
    
    currentQuestionIndex: integer('current_question_index').default(0).notNull(),
    answeredQuestions: integer('answered_questions').default(0).notNull(),
    correctAnswers: integer('correct_answers').default(0).notNull(),
    wrongAnswers: integer('wrong_answers').default(0).notNull(),
    
    timeLimit: integer('time_limit').notNull(),
    timeRemaining: integer('time_remaining').notNull(),
    
    questions: jsonb('questions').notNull(),
    userAnswers: jsonb('user_answers').default([]),
    
    status: text('status').default('in_progress').notNull(),
    
    expiresAt: timestamp('expires_at').notNull(),
    
    startedAt: timestamp('started_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("quiz_session_userId_idx").on(table.userId),
    index("quiz_session_status_idx").on(table.status),
  ],
);

export const quizResult = pgTable(
  "quiz_result",
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => quizSession.id, { onDelete: "cascade" }),
    
    category: text('category'),
    difficulty: text('difficulty'),
    questionType: text('question_type'),
    
    totalQuestions: integer('total_questions').notNull(),
    answeredQuestions: integer('answered_questions').notNull(),
    correctAnswers: integer('correct_answers').notNull(),
    wrongAnswers: integer('wrong_answers').notNull(),
    skippedQuestions: integer('skipped_questions').notNull(),
    
    timeLimitSeconds: integer('time_limit_seconds').notNull(),
    timeTakenSeconds: integer('time_taken_seconds').notNull(),
    scorePercentage: integer('score_percentage').notNull(),
    
    completionReason: text('completion_reason').notNull(),
    completedAt: timestamp('completed_at').defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("quiz_result_userId_idx").on(table.userId),
    index("quiz_result_sessionId_idx").on(table.sessionId),
  ],
);

export const quizSessionRelations = relations(quizSession, ({ one }) => ({
  user: one(user, {
    fields: [quizSession.userId],
    references: [user.id],
  }),
  result: one(quizResult),
}));

export const quizResultRelations = relations(quizResult, ({ one }) => ({
  user: one(user, {
    fields: [quizResult.userId],
    references: [user.id],
  }),
  session: one(quizSession, {
    fields: [quizResult.sessionId],
    references: [quizSession.id],
  }),
}));
