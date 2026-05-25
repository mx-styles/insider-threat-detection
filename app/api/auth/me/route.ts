import { getSession, createSession } from '@/lib/auth';
import { updateAuthUser } from '@/lib/auth-users';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }
  return Response.json({ user: session.user });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const { name, password } = body;

  const updated = updateAuthUser(session.user.id, { name, password });
  if (!updated) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  const updatedUser = {
    ...session.user,
    name: updated.name,
  };

  await createSession(updatedUser);

  return Response.json({ user: updatedUser });
}
