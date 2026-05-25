import { deactivateUser, activateUser, getUser } from '@/lib/user-store';
import { getSession } from '@/lib/auth';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }
  if (!session.user.isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const user = getUser(id);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  const updated = user.active ? deactivateUser(id) : activateUser(id);
  return Response.json({ user: updated });
}
