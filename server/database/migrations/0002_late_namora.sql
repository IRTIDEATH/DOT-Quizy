CREATE TABLE "quiz_result" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"category" text,
	"difficulty" text,
	"question_type" text,
	"total_questions" integer NOT NULL,
	"answered_questions" integer NOT NULL,
	"correct_answers" integer NOT NULL,
	"wrong_answers" integer NOT NULL,
	"skipped_questions" integer NOT NULL,
	"time_limit_seconds" integer NOT NULL,
	"time_taken_seconds" integer NOT NULL,
	"score_percentage" integer NOT NULL,
	"completion_reason" text NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"total_questions" integer NOT NULL,
	"category" text,
	"category_id" integer,
	"difficulty" text,
	"question_type" text,
	"current_question_index" integer DEFAULT 0 NOT NULL,
	"answered_questions" integer DEFAULT 0 NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"wrong_answers" integer DEFAULT 0 NOT NULL,
	"time_limit" integer NOT NULL,
	"time_remaining" integer NOT NULL,
	"questions" jsonb NOT NULL,
	"user_answers" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quiz_result" ADD CONSTRAINT "quiz_result_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_result" ADD CONSTRAINT "quiz_result_session_id_quiz_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."quiz_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_session" ADD CONSTRAINT "quiz_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quiz_result_userId_idx" ON "quiz_result" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "quiz_result_sessionId_idx" ON "quiz_result" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "quiz_session_userId_idx" ON "quiz_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "quiz_session_status_idx" ON "quiz_session" USING btree ("status");