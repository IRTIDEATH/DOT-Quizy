import { Context, Next } from 'hono';
import { auth } from '../lib/auth';

type AuthUser = typeof auth.$Infer.Session.user;
type AuthSession = typeof auth.$Infer.Session.session;

export interface AuthContext {
  Variables: {
    user: AuthUser | null;
    session: AuthSession | null;
  };
}

// attach user and session to context (optional auth)
export async function authMiddleware(c: Context<AuthContext>, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  c.set('user', session?.user ?? null);
  c.set('session', session?.session ?? null);

  await next();
}

export async function requireAuth(c: Context<AuthContext>, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('user', session.user);
  c.set('session', session.session);

  await next();
}
