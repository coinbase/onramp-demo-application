import { NextRequest, NextResponse } from 'next/server';
import { generateJWT } from '../../utils/sessionTokenApi';
import { logger } from '../../utils/logger';

/**
 * GET /api/sell-config
 * Fetches the list of supported countries and payment methods for offramp
 * CDP API Docs: https://docs.cdp.coinbase.com/api-reference/rest-api/onramp-offramp/get-sell-config
 */
export async function GET(request: NextRequest) {
  try {
    // Get API credentials from environment variables
    const keyName = process.env.CDP_API_KEY || process.env.CDP_API_KEY_NAME;
    const keySecret = process.env.CDP_API_SECRET || process.env.CDP_API_KEY_PRIVATE_KEY;

    if (!keyName || !keySecret) {
      logger.error('Missing CDP API credentials');
      return NextResponse.json(
        {
          error: 'Server configuration error',
        },
        { status: 500 }
      );
    }

    // Prepare request to Coinbase Sell Config API
    const cdpApiUrl = 'https://api.developer.coinbase.com/onramp/v1/sell/config';
    const apiPath = '/onramp/v1/sell/config';

    // Generate JWT for authentication
    let jwtToken: string;
    try {
      jwtToken = await generateJWT(keyName, keySecret, apiPath, 'GET');
      logger.debug('JWT generated successfully for sell config endpoint');
    } catch (error) {
      logger.error('JWT generation failed', { error });

      return NextResponse.json(
        {
          error: 'Authentication failed',
        },
        { status: 500 }
      );
    }

    logger.debug('Making request to CDP Sell Config API');

    // Make request to Coinbase API
    const response = await fetch(cdpApiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      logger.error('CDP Sell Config API error', {
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText
      });

      return NextResponse.json(
        {
          error: 'Failed to fetch sell config',
          details: responseText,
        },
        { status: response.status }
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
        { status: 500 }
      );
    }

    logger.info('Sell config fetched successfully', {
      countryCount: data.countries?.length || 0,
    });

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Error fetching sell config', { error });
    return NextResponse.json(
      {
        error: 'Failed to fetch sell config',
      },
      { status: 500 }
    );
  }
}

