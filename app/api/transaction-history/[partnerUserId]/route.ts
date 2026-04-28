import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../../../utils/logger';

interface RouteContext {
  params: {
    partnerUserId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { partnerUserId } = params;

  if (!partnerUserId) {
    return NextResponse.json(
      { error: 'Missing required parameter: partnerUserId' },
      { status: 400 }
    );
  }

  logger.info('Transaction history requested', {
    hasPageKey: request.nextUrl.searchParams.has('page_key'),
    hasPageSize: request.nextUrl.searchParams.has('page_size'),
  });

  // The demo app does not persist orders locally. Return an empty history
  // instead of a 404 so the UI can render its "no history" state intentionally.
  return NextResponse.json([]);
}
