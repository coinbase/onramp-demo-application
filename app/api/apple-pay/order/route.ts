import { NextRequest, NextResponse } from 'next/server';
import { generateJwt } from '@coinbase/cdp-sdk/auth';
import { logger } from '../../../utils/logger';
import { rateLimit } from '../../../utils/rateLimit';

// ✅ CORS Configuration - Allow requests from approved domains
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
  // Production domains
  'https://onramp-demo-application-git-main-coinbase-vercel.vercel.app',
  'https://onramp-demo-application.vercel.app',
  'https://www.onrampdemo.com',
  // Feature branch preview (for testing)
  'https://onramp-demo-application-git-feature-appl-889240-coinbase-vercel.vercel.app',
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

/**
 * Generates a JWT token for CDP API v2 authentication
 */
async function generateJWTForV2(keyName: string, keySecret: string): Promise<string> {
  const requestMethod = 'POST';
  const requestHost = 'api.cdp.coinbase.com';
  const requestPath = '/platform/v2/onramp/orders';
  
  try {
    // Process the private key to ensure it has proper newlines
    let processedKey = keySecret;
    if (keySecret.includes('\\n')) {
      processedKey = keySecret.replace(/\\n/g, '\n');
    }
    
    // Use the CDP SDK to generate the JWT
    const token = await generateJwt({
      apiKeyId: keyName,
      apiKeySecret: processedKey,
      requestMethod: requestMethod,
      requestHost: requestHost,
      requestPath: requestPath,
      expiresIn: 120
    });
    
    return token;
  } catch (error) {
    logger.error('Error generating JWT for v2 API:', error);
    throw error;
  }
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
    // Apply rate limiting (10 requests per minute)
    const rateLimitResult = rateLimit(request, { limit: 10, windowMs: 60000 });
    
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: corsHeaders }
      );
    }

    // Get API credentials
    const keyName = process.env.CDP_API_KEY || process.env.CDP_API_KEY_NAME;
    const keySecret = process.env.CDP_API_SECRET || process.env.CDP_API_KEY_PRIVATE_KEY;

    if (!keyName || !keySecret) {
      logger.error('Missing CDP API credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, phoneNumber, amount, asset, network, destinationAddress } = body;

    logger.info('Apple Pay order request received', {
      email,
      phoneNumber: phoneNumber ? `${phoneNumber.substring(0, 5)}...` : 'missing',
      amount,
      asset,
      network,
      destinationAddress: destinationAddress ? `${destinationAddress.substring(0, 10)}...` : 'missing'
    });

    // Validate required fields
    if (!email || !phoneNumber || !destinationAddress) {
      const missingFields = [];
      if (!email) missingFields.push('email');
      if (!phoneNumber) missingFields.push('phoneNumber');
      if (!destinationAddress) missingFields.push('destinationAddress');
      
      logger.warn('Missing required fields', { missingFields });
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          details: `Missing: ${missingFields.join(', ')}`,
          required: ['email', 'phoneNumber', 'destinationAddress']
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate phone number format (US only)
    if (!phoneNumber.match(/^\+1\d{10}$/)) {
      logger.warn('Invalid phone number format', { phoneNumber: phoneNumber.substring(0, 5) + '...' });
      return NextResponse.json(
        { 
          error: 'Invalid phone number format. Must be +1XXXXXXXXXX (US only)',
          example: '+12345678901'
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      logger.warn('Invalid amount', { amount });
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Generate JWT for v2 API
    let jwtToken: string;
    try {
      jwtToken = await generateJWTForV2(keyName, keySecret);
      logger.debug('JWT generated successfully for v2 API');
    } catch (error) {
      logger.error('JWT generation failed', { error });
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Call Coinbase v2 Order API
    const cdpApiUrl = 'https://api.cdp.coinbase.com/platform/v2/onramp/orders';
    
    // SANDBOX MODE: Use sandbox prefix for testing (no real charges)
    // This ensures all transactions are in sandbox mode and no real funds are transferred
    // Combined with useApplePaySandbox=true on the frontend, this provides full sandbox testing
    const partnerUserRef = `sandbox-${email.split('@')[0]}-${Date.now()}`;
    logger.info('Using sandbox mode', { partnerUserRef });
    
    // Get current timestamp for agreements
    const currentTimestamp = new Date().toISOString();
    
    // Extract client IP (required by CDP API)
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
    
    // Get origin for domain parameter
    const origin = request.headers.get('origin');
    
    const requestBody: any = {
      partnerUserRef: partnerUserRef,
      email: email,
      phoneNumber: phoneNumber,
      paymentAmount: amount.toString(),
      paymentCurrency: 'USD',
      purchaseCurrency: asset,
      paymentMethod: 'GUEST_CHECKOUT_APPLE_PAY',
      destinationAddress: destinationAddress,
      destinationNetwork: network,
      agreementAcceptedAt: currentTimestamp,
      phoneNumberVerifiedAt: currentTimestamp,
      clientIp: clientIp,
    };
    
    // IMPORTANT: Domain parameter handling for sandbox mode
    // For sandbox testing (with useApplePaySandbox=true on frontend):
    // - We must OMIT the domain parameter entirely for localhost
    // - The frontend appends useApplePaySandbox=true which bypasses domain checks
    // - For production domains, include the domain (must be allowlisted in CDP Portal)
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      requestBody.domain = origin;
      logger.info('Including domain for production', { domain: origin });
    } else {
      logger.info('Omitting domain for localhost - sandbox mode will use useApplePaySandbox=true', { origin });
    }

    logger.info('Creating Apple Pay order', { 
      email, 
      asset, 
      network, 
      amount,
      partnerUserRef,
      requestBody: JSON.stringify(requestBody, null, 2) // Log full request for debugging
    });

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
        response: responseText
      });

      let errorDetails = 'Failed to create Apple Pay order';
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.errorMessage) {
          errorDetails = errorData.errorMessage;
        }
      } catch (e) {
        // If response is not JSON, use raw text
        errorDetails = responseText || 'Unknown error from CDP API';
      }

      // In development or if explicitly requested, return more details
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return NextResponse.json(
        {
          error: errorDetails,
          status: response.status,
          ...(isDevelopment && { 
            debug: {
              statusText: response.statusText,
              rawResponse: responseText
            }
          })
        },
        { status: response.status, headers: corsHeaders }
      );
    }

    const data = JSON.parse(responseText);
    logger.info('Apple Pay order created successfully', { 
      orderId: data.order?.orderId,
      partnerUserRef 
    });

    return NextResponse.json({
      orderId: data.order?.orderId,
      paymentLinkUrl: data.paymentLink?.url,
      partnerUserRef: partnerUserRef,
    }, { headers: corsHeaders });
  } catch (error) {
    logger.error('Error creating Apple Pay order', { error });
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500, headers: corsHeaders }
    );
  }
}

