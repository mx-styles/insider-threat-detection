import { validateCredentials, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return Response.json({ error: 'Username and password are required' }, { status: 400 });
  }

  const result = validateCredentials(username, password);

  if ('error' in result) {
    return Response.json({ error: result.error }, { status: 401 });
  }

  await createSession(result.user);

  return Response.json({ user: result.user });
}
