import { getSession } from '@/lib/auth';
import { getAuthUser, updateAuthUser, deleteAuthUser } from '@/lib/auth-users';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  if (!session.user.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const user = updateAuthUser(id, body);
  if (!user) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({ user });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  if (!session.user.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  if (id === session.user.id) return Response.json({ error: 'Cannot delete yourself' }, { status: 400 });

  if (!deleteAuthUser(id)) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({ ok: true });
}
