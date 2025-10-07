import { NextRequest, NextResponse } from 'next/server';
import { generateJWT } from '../../utils/sessionTokenApi';
import { logger } from '../../utils/logger';
import { rateLimit } from '../../utils/rateLimit';
import { sessionTokenRequestSchema } from '../../utils/validation';

// Types for session token request
interface SessionTokenRequest {
  addresses: Array<{
    address: string;
    blockchains: string[];
  }>;
  assets?: string[];
}

// ✅ CORS Configuration - REQUIRED by Coinbase Security Requirements
// Only allow requests from your approved domains
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
  // Production domains
  'https://onramp-demo-application-git-main-coinbase-vercel.vercel.app',
  'https://www.onrampdemo.com',
];

function setCorsHeaders(origin: string | null): Record<string, string> {
  // Check if origin is allowed
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    };
  }
  
  // ⚠️ If origin not allowed, don't return CORS headers
  // This will cause browser to block the request
  return {};
}

// Handle preflight OPTIONS requests
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

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = setCorsHeaders(origin);
  
  // ✅ CORS Protection - Reject requests from unauthorized origins
  if (origin && Object.keys(corsHeaders).length === 0) {
    logger.warn('CORS: Rejected request from unauthorized origin', { origin });
    return NextResponse.json(
      { error: 'Unauthorized origin' },
      { status: 403 }
    );
  }

  try {
    // ✅ Apply rate limiting (10 requests per minute)
    const rateLimitResult = rateLimit(request, { limit: 10, windowMs: 60000 });
    
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000);
      logger.warn('Rate limit exceeded', { 
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
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.resetTime)
          }
        }
      );
    }

    // Get API credentials from environment variables
    const keyName = process.env.CDP_API_KEY || process.env.CDP_API_KEY_NAME;
    const keySecret = process.env.CDP_API_SECRET || process.env.CDP_API_KEY_PRIVATE_KEY;

    if (!keyName || !keySecret) {
      logger.error('Missing CDP API credentials');
      return NextResponse.json(
        {
          error: 'Server configuration error',
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    // ✅ Validate input with Zod
    const validationResult = sessionTokenRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      logger.warn('Invalid request body', { 
        errors: validationResult.error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      });
      
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors.map(e => e.message)
        },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const { addresses, assets } = validationResult.data;

    // ✅ Extract client IP (required by CDP API)
    // NOTE: CDP API does NOT accept private IP addresses (127.0.0.1, 10.x.x.x, 192.168.x.x, etc.)
    // For local development, we use a public test IP address
    // In production, extract the real client IP from the network layer
    let clientIp = 
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.ip;
    
    // Check if IP is private or localhost and use a public test IP for development
    const isPrivateIp = !clientIp || 
      clientIp === '127.0.0.1' || 
      clientIp === 'localhost' ||
      clientIp === '::1' ||
      clientIp.startsWith('10.') || 
      clientIp.startsWith('192.168.') ||
      clientIp.startsWith('172.16.') ||
      clientIp.startsWith('172.17.') ||
      clientIp.startsWith('172.18.') ||
      clientIp.startsWith('172.19.') ||
      clientIp.startsWith('172.20.') ||
      clientIp.startsWith('172.21.') ||
      clientIp.startsWith('172.22.') ||
      clientIp.startsWith('172.23.') ||
      clientIp.startsWith('172.24.') ||
      clientIp.startsWith('172.25.') ||
      clientIp.startsWith('172.26.') ||
      clientIp.startsWith('172.27.') ||
      clientIp.startsWith('172.28.') ||
      clientIp.startsWith('172.29.') ||
      clientIp.startsWith('172.30.') ||
      clientIp.startsWith('172.31.');
    
    if (isPrivateIp) {
      // Use a valid public test IP for development (example IP from documentation RFC 5737)
      clientIp = '192.0.2.1';
      logger.debug('Using test public IP for development', { originalIp: request.ip });
    }

    // Generate JWT for authentication
    let jwtToken: string;
    try {
      jwtToken = await generateJWT(keyName, keySecret);
      logger.debug('JWT generated successfully');
    } catch (error) {
      logger.error('JWT generation failed', { error });
      
      return NextResponse.json(
        {
          error: 'Authentication failed',
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // Prepare request to Coinbase API
    const cdpApiUrl = 'https://api.developer.coinbase.com/onramp/v1/token';
    
    const requestBody = {
      addresses,
      ...(assets && { assets }),
      clientIp, // ✅ Include client IP as required by CDP API
    };

    logger.debug('Making request to CDP API', {
      addressCount: addresses.length,
      hasAssets: !!assets,
    });

    // Make request to Coinbase API
    const response = await fetch(cdpApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      logger.error('CDP API error', { 
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText 
      });
      
      // In development, return more details
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(
          {
            error: 'Failed to generate session token',
            details: responseText,
            status: response.status
          },
          { status: response.status, headers: corsHeaders }
        );
      }
      
      return NextResponse.json(
        {
          error: 'Failed to generate session token',
        },
        { status: response.status, headers: corsHeaders }
      );
    }

    // Parse successful response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      logger.error('Failed to parse CDP API response', { error });
      return NextResponse.json(
        {
          error: 'Invalid response from server',
        },
        { status: 500, headers: corsHeaders }
      );
    }

    logger.info('Session token generated successfully');

    // Return the session token
    return NextResponse.json(
      {
        token: data.token,
        channel_id: data.channelId || data.channel_id,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Error generating session token', { error });
    return NextResponse.json(
      {
        error: 'Failed to generate session token',
      },
      { status: 500, headers: corsHeaders }
    );
  }
} 