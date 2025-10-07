import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../../../utils/logger';
import { rateLimit } from '../../../utils/rateLimit';

// ✅ CORS Configuration - REQUIRED by Coinbase Security Requirements
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
  // Production domains
  'https://onramp-demo-application-git-main-coinbase-vercel.vercel.app',
  'https://www.onrampdemo.com',
];

function setCorsHeaders(origin: string | null): Record<string, string> {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };
  }
  return {};
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = setCorsHeaders(origin);
  
  if (Object.keys(corsHeaders).length === 0) {
    logger.warn('CORS: Rejected preflight from unauthorized origin', { origin });
    return new NextResponse(null, { status: 403 });
  }
  
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * API endpoint to generate session tokens for Fund components
 * This allows Fund components to work with secure initialization enabled
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = setCorsHeaders(origin);
  
  // ✅ CORS Protection
  if (origin && Object.keys(corsHeaders).length === 0) {
    logger.warn('CORS: Rejected request from unauthorized origin', { origin });
    return NextResponse.json(
      { error: 'Unauthorized origin' },
      { status: 403 }
    );
  }
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request, { limit: 20, windowMs: 60000 });
    
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000);
      logger.warn('Rate limit exceeded for fund session', { 
        ip: request.headers.get('x-forwarded-for') || 'unknown' 
      });
      
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter 
        },
        { 
          status: 429,
          headers: {
            ...corsHeaders,
            'Retry-After': String(retryAfter)
          }
        }
      );
    }

    const body = await request.json();
    const { address, blockchains = ['base'] } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Generate session token using the existing session API
    // Validate host against trusted domains to prevent SSRF
    const host = request.headers.get('host') || 'localhost:3000';
    const trustedHosts = [
      'localhost:3000',
      'localhost:3001',
      'onramp-demo-application-git-main-coinbase-vercel.vercel.app',
      'www.onrampdemo.com',
    ];
    
    if (!trustedHosts.some(trusted => host.includes(trusted))) {
      logger.warn('Untrusted host attempted internal API call', { host });
      return NextResponse.json(
        { error: 'Invalid host' },
        { status: 403, headers: corsHeaders }
      );
    }
    
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const sessionApiUrl = `${protocol}://${host}/api/session`;
    
    const sessionResponse = await fetch(
      sessionApiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addresses: [{
            address,
            blockchains
          }]
        }),
      }
    );

    if (!sessionResponse.ok) {
      const error = await sessionResponse.json();
      logger.error('Failed to generate session token for fund', { error });
      return NextResponse.json(
        { error: 'Failed to generate session token' },
        { status: sessionResponse.status, headers: corsHeaders }
      );
    }

    const data = await sessionResponse.json();
    logger.info('Fund session token generated successfully');

    return NextResponse.json(
      {
        token: data.token,
        channel_id: data.channel_id
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    logger.error('Error in fund session endpoint', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
