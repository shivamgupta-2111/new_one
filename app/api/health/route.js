import { NextResponse } from 'next/server';

// Simple liveness check for hosting platforms and uptime monitors.
export function GET() {
  return NextResponse.json({ status: 'ok', time: new Date().toISOString() });
}
