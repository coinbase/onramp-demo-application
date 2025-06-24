import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

// Types for session token request
interface SessionTokenRequest {
  addresses: Array<{
    address: string;
    blockchains: string[];
  }>;
  assets?: string[];
}

// Function to format the private key properly
function formatPrivateKey(keySecret: string): string {
  // Remove any whitespace
  keySecret = keySecret.trim();
  
  // Check if it already has PEM headers
  if (keySecret.includes('BEGIN EC PRIVATE KEY')) {
    return keySecret;
  }
  
  // If it's just the base64 content, wrap it with PEM headers
  // Split the base64 string into lines of 64 characters
  const base64Lines = keySecret.match(/.{1,64}/g) || [];
  const pemFormatted = [
    '-----BEGIN EC PRIVATE KEY-----',
    ...base64Lines,
    '-----END EC PRIVATE KEY-----'
  ].join('\n');
  
  return pemFormatted;
}

// Function to generate JWT token for CDP API authentication
function generateJWT(keyName: string, keySecret: string): string {
  const requestMethod = 'POST';
  const requestHost = 'api.developer.coinbase.com';
  const requestPath = '/onramp/v1/token';
  
  // Construct the URI as per CDP documentation
  const uri = `${requestMethod} ${requestHost}${requestPath}`;
  
  const payload = {
    iss: 'cdp',
    nbf: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 120, // JWT expires in 120 seconds
    sub: keyName,
    uri,
  };

  const header = {
    alg: 'ES256',
    kid: keyName,
    nonce: crypto.randomBytes(16).toString('hex'),
  };

  try {
    // Format and parse the private key
    const formattedKey = formatPrivateKey(keySecret);
    console.log('Attempting to parse private key...');
    
    // Try to create the private key object
    const privateKey = crypto.createPrivateKey({
      key: formattedKey,
      format: 'pem',
      type: 'sec1' // EC private key format
    });

    // Sign the JWT with the private key
    return jwt.sign(payload, privateKey, { algorithm: 'ES256', header });
  } catch (error) {
    console.error('Error parsing private key:', error);
    // If parsing fails, try with the key as-is (backward compatibility)
    return jwt.sign(payload, keySecret, { algorithm: 'ES256', header });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get API credentials from environment variables
    const keyName = process.env.CDP_API_KEY || process.env.CDP_API_KEY_NAME;
    const keySecret = process.env.CDP_API_SECRET || process.env.CDP_API_KEY_PRIVATE_KEY;

    if (!keyName || !keySecret) {
      console.error('Missing CDP API credentials');
      return NextResponse.json(
        {
          error: 'Missing CDP API credentials. Please set CDP_API_KEY and CDP_API_SECRET environment variables.',
        },
        { status: 500 }
      );
    }

    console.log('CDP API Key Name format check:', {
      hasOrganizations: keyName.includes('organizations/'),
      hasApiKeys: keyName.includes('/apiKeys/'),
      keyNameLength: keyName.length
    });

    // Parse request body
    const body = await request.json();
    const { addresses, assets } = body as SessionTokenRequest;

    if (!addresses || addresses.length === 0) {
      return NextResponse.json(
        {
          error: 'Addresses parameter is required',
        },
        { status: 400 }
      );
    }

    // Generate JWT for authentication
    let jwtToken: string;
    try {
      jwtToken = generateJWT(keyName, keySecret);
      console.log('JWT generated successfully');
    } catch (error) {
      console.error('JWT generation failed:', error);
      
      // Provide more helpful error message
      if (error instanceof Error && error.message.includes('secretOrPrivateKey')) {
        return NextResponse.json(
          {
            error: 'Invalid private key format',
            details: 'The CDP_API_SECRET should be your EC private key. If you have just the base64 content, ensure it\'s properly formatted.',
            hint: 'Your private key should either be in PEM format with BEGIN/END headers, or just the base64 content that will be wrapped automatically.'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        {
          error: 'Failed to authenticate with CDP API',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Prepare request to Coinbase API
    const cdpApiUrl = 'https://api.developer.coinbase.com/onramp/v1/token';
    
    const requestBody = {
      addresses,
      ...(assets && { assets }),
    };

    console.log('Making request to CDP API:', {
      url: cdpApiUrl,
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
      console.error('CDP API error:', response.status, response.statusText);
      console.error('Response body:', responseText);
      
      // Try to parse error as JSON
      let errorDetails;
      try {
        errorDetails = JSON.parse(responseText);
      } catch {
        errorDetails = responseText;
      }
      
      // Provide helpful error messages based on status code
      if (response.status === 401) {
        return NextResponse.json(
          {
            error: 'Authentication failed',
            details: 'Please verify your CDP API key and secret are correct. The API key should be in the format: organizations/{org_id}/apiKeys/{key_id}',
            apiError: errorDetails
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        {
          error: `CDP API error: ${response.status} ${response.statusText}`,
          details: errorDetails,
        },
        { status: response.status }
      );
    }

    // Parse successful response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse response:', responseText);
      return NextResponse.json(
        {
          error: 'Invalid response from CDP API',
          details: responseText,
        },
        { status: 500 }
      );
    }

    console.log('Successfully generated session token');

    // Return the session token
    return NextResponse.json({
      token: data.token,
      channel_id: data.channelId || data.channel_id,
    });
  } catch (error) {
    console.error('Error generating session token:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate session token',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 