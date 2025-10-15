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
    
    // Extract client IP (optional but recommended)
    const clientIp = 
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      '127.0.0.1';
    
    const requestBody = {
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
      // Domain required for iframe embedding
      domain: request.headers.get('origin') || 'localhost:3000',
    };

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

