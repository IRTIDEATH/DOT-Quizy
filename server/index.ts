import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { config } from "./config";
import { auth } from "./lib/auth";
import { cors } from "hono/cors";
import quizRoutes from "./routes/quiz.routes";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>().basePath("/api");

// Global error handler
app.onError((err, c) => {
  console.error(`[Error] ${c.req.method} ${c.req.path}:`, err);

  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      err.status
    );
  }

  return c.json(
    {
      success: false,
      error: config.isProduction 
        ? "Internal Server Error" 
        : err.message,
    },
    500
  );
});

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: "Not Found",
      path: c.req.path,
    },
    404
  );
});

app.use(
  cors({
    origin: config.clientUrl,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.route("/quiz", quizRoutes);

export type AppType = typeof app;
export default app;
