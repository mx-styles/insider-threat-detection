import { mockData } from '@/lib/mock-data';

export async function GET() {
  return Response.json({ alerts: mockData.alerts });
}
