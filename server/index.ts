import { Hono } from 'hono'
import { auth } from './lib/auth';

const app = new Hono()

const router = app.on(["POST", "GET"], "/api/auth/*", (c) => {
	return auth.handler(c.req.raw);
});

export type AppType = typeof router
export default app
