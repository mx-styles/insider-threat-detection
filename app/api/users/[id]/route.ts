import { getUser, updateUser } from '@/lib/user-store';
import { getSession } from '@/lib/auth';
import { mockData } from '@/lib/mock-data';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;
  const user = getUser(id);
  const detail = mockData.userDetails[id];
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  return Response.json({ user: { ...user, ...(detail ?? {}) } });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }
  if (!session.user.isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const updated = updateUser(id, body);
  if (!updated) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  return Response.json({ user: updated });
}
