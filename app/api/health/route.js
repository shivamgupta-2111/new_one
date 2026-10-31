export const runtime = 'nodejs';

export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'sales-cloud',
    timestamp: new Date().toISOString(),
  });
}
