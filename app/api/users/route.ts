import { listUsers, createUser } from '@/lib/user-store';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const users = listUsers();
  return Response.json({ users });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, department, role } = body;

  if (!name || !email || !department || !role) {
    return Response.json({ error: 'All fields are required' }, { status: 400 });
  }

  const user = createUser({ name, email, department, role });
  return Response.json({ user }, { status: 201 });
}
