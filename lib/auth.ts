import { cookies } from 'next/headers';
import { getAuthUserByUsername, validateAuthUserPassword } from './auth-users';

export type AuthUser = {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
};

export type Session = {
  user: AuthUser;
  expires: number;
};

const COOKIE_NAME = 'session';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export function validateCredentials(
  username: string,
  password: string
): { user: AuthUser } | { error: string } {
  const record = getAuthUserByUsername(username);
  if (!record) return { error: 'Invalid credentials' };
  if (!record.active) return { error: 'Account is deactivated' };
  if (!validateAuthUserPassword(username, password)) return { error: 'Invalid credentials' };
  return {
    user: {
      id: record.id,
      username: record.username,
      name: record.name,
      email: `${record.username}@company.com`,
      role: record.role === 'admin' ? 'System Admin' : record.role === 'analyst' ? 'SOC Analyst' : 'Viewer',
      isAdmin: record.isAdmin,
    },
  };
}

export async function createSession(user: AuthUser) {
  const cookieStore = await cookies();
  const session: Session = {
    user,
    expires: Date.now() + SESSION_DURATION_MS,
  };
  cookieStore.set(COOKIE_NAME, Buffer.from(JSON.stringify(session)).toString('base64'), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const session: Session = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
    if (session.expires < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}
