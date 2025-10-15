import { NextRequest, NextResponse } from 'next/server';
import { generateJwt } from '@coinbase/cdp-sdk/auth';
import { logger } from '../../../utils/logger';
import { rateLimit } from '../../../utils/rateLimit';

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
  try {
    // Apply rate limiting (10 requests per minute)
    const rateLimitResult = rateLimit(request, { limit: 10, windowMs: 60000 });
    
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Get API credentials
    const keyName = process.env.CDP_API_KEY || process.env.CDP_API_KEY_NAME;
    const keySecret = process.env.CDP_API_SECRET || process.env.CDP_API_KEY_PRIVATE_KEY;

    if (!keyName || !keySecret) {
      logger.error('Missing CDP API credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, phoneNumber, amount, asset, network, destinationAddress } = body;

    // Validate required fields
    if (!email || !phoneNumber || !destinationAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: email, phoneNumber, and destinationAddress are required' },
        { status: 400 }
      );
    }

    // Validate phone number format (US only)
    if (!phoneNumber.match(/^\+1\d{10}$/)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Must be +1XXXXXXXXXX (US only)' },
        { status: 400 }
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
        { status: 500 }
      );
    }

    // Call Coinbase v2 Order API
    const cdpApiUrl = 'https://api.cdp.coinbase.com/platform/v2/onramp/orders';
    
    // Use sandbox prefix for testing (no real charges)
    const partnerUserRef = `sandbox-${email.split('@')[0]}-${Date.now()}`;
    
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
    
    // Only include domain for production environments (not localhost)
    // The domain must be allowlisted with Coinbase for Apple Pay web app
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      requestBody.domain = origin;
      logger.debug('Including domain in request', { domain: origin });
    } else {
      logger.debug('Omitting domain for local development', { origin });
    }

    logger.info('Creating Apple Pay order', { 
      email, 
      asset, 
      network, 
      amount,
      partnerUserRef 
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

      // In development, return more details
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(
          {
            error: 'Failed to create Apple Pay order',
            details: responseText,
            status: response.status
          },
          { status: response.status }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create Apple Pay order' },
        { status: response.status }
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
    });
  } catch (error) {
    logger.error('Error creating Apple Pay order', { error });
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

