import { NextResponse } from 'next/server';
import { generateJWT } from '../../utils/sessionTokenApi';
import { logger } from '../../utils/logger';

/**
 * GET /api/buy-config
 * Fetches the list of countries supported by Coinbase Pay Onramp and payment methods
 * CDP API Docs: https://docs.cdp.coinbase.com/api-reference/rest-api/onramp-offramp/get-buy-config
 */
export async function GET() {
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

    // Prepare request to Coinbase Buy Config API
    const cdpApiUrl = `https://api.developer.coinbase.com/onramp/v1/buy/config`;
    const apiPath = `/onramp/v1/buy/config`;

    // Generate JWT for authentication
    let jwtToken: string;
    try {
      jwtToken = await generateJWT(keyName, keySecret, apiPath, 'GET');
      logger.debug('JWT generated successfully for buy config endpoint', { apiPath });
    } catch (error) {
      logger.error('JWT generation failed', { error });

      return NextResponse.json(
        {
          error: 'Authentication failed',
        },
        { status: 500 }
      );
    }

    logger.debug('Making request to CDP Buy Config API');

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
      logger.error('CDP Buy Config API error', {
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText
      });

      return NextResponse.json(
        {
          error: 'Failed to fetch buy config',
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

    logger.info('Buy config fetched successfully', {
      countriesCount: data.countries?.length || 0,
    });

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Error fetching buy config', { error });
    return NextResponse.json(
      {
        error: 'Failed to fetch buy config',
      },
      { status: 500 }
    );
  }
}
