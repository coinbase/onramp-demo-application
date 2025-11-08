import { NextRequest, NextResponse } from 'next/server';
import { generateJWT } from '../../utils/sessionTokenApi';
import { logger } from '../../utils/logger';

/**
 * GET /api/sell-options
 * Fetches available crypto assets and fiat currencies for offramp
 * CDP API Docs: https://docs.cdp.coinbase.com/api-reference/rest-api/onramp-offramp/get-sell-options
 * 
 * Query Parameters:
 * - country (required): ISO 3166-1 two-letter country code (e.g., 'US')
 * - subdivision (optional): ISO 3166-2 two-letter state code (e.g., 'NY'), required for US
 * - networks (optional): Comma-separated list of network names (e.g., 'ethereum,polygon')
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');
    const subdivision = searchParams.get('subdivision');
    const networks = searchParams.get('networks');

    if (!country) {
      return NextResponse.json(
        {
          error: 'Missing required parameter: country',
        },
        { status: 400 }
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
        { status: 500 }
      );
    }

    // Build query string
    const queryParams = new URLSearchParams({ country });
    if (subdivision) {
      queryParams.append('subdivision', subdivision);
    }
    if (networks) {
      queryParams.append('networks', networks);
    }

    // Prepare request to Coinbase Sell Options API
    const cdpApiUrl = `https://api.developer.coinbase.com/onramp/v1/sell/options?${queryParams.toString()}`;
    // Note: JWT path should NOT include query parameters for GET requests
    const apiPath = `/onramp/v1/sell/options`;

    // Generate JWT for authentication
    let jwtToken: string;
    try {
      jwtToken = await generateJWT(keyName, keySecret, apiPath, 'GET');
      logger.debug('JWT generated successfully for sell options endpoint', { apiPath, queryParams: queryParams.toString() });
    } catch (error) {
      logger.error('JWT generation failed', { error });

      return NextResponse.json(
        {
          error: 'Authentication failed',
        },
        { status: 500 }
      );
    }

    logger.debug('Making request to CDP Sell Options API', {
      country,
      subdivision,
      networks,
    });

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
      logger.error('CDP Sell Options API error', {
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText
      });

      return NextResponse.json(
        {
          error: 'Failed to fetch sell options',
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

    logger.info('Sell options fetched successfully', {
      sellCurrenciesCount: data.sell_currencies?.length || 0,
      cashoutCurrenciesCount: data.cashout_currencies?.length || 0,
    });

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Error fetching sell options', { error });
    return NextResponse.json(
      {
        error: 'Failed to fetch sell options',
      },
      { status: 500 }
    );
  }
}

