import { mockData } from '@/lib/mock-data';

export async function GET() {
  return Response.json({ logs: mockData.auditLogs });
}
