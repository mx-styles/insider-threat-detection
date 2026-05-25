import { getSession } from '@/lib/auth';
import { listAuthUsers, createAuthUser, getAuthUserByUsername } from '@/lib/auth-users';

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  if (!session.user.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const users = listAuthUsers();
  return Response.json({ users });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  if (!session.user.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { username, name, role, password } = body;

  if (!username || !name || !role || !password) {
    return Response.json({ error: 'All fields are required' }, { status: 400 });
  }

  if (getAuthUserByUsername(username)) {
    return Response.json({ error: 'Username already taken' }, { status: 409 });
  }

  const user = createAuthUser({ username, name, role, password });
  return Response.json({ user }, { status: 201 });
}
