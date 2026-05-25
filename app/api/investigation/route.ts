import type { NextRequest } from 'next/server';
import { mockData } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const alertId = request.nextUrl.searchParams.get('id') ?? '';
  const detail = mockData.investigations[alertId];

  if (!detail) {
    const fallback = Object.values(mockData.investigations)[0];
    if (fallback) {
      return Response.json({ investigation: fallback });
    }
  }

  if (!detail) {
    return Response.json({ error: 'Investigation not found' }, { status: 404 });
  }

  return Response.json({ investigation: detail });
}
