import { Hono } from "hono";
import { auth } from "./lib/auth";
import { cors } from "hono/cors";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>().basePath("/api");

app.use(
  cors({
    origin: process.env.CLIENT_URL!,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

const router = app.on(["POST", "GET"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

export type AppType = typeof router;
export default app;
