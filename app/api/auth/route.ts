import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';

async function parseJsonBody(request: Request) {
  const rawBody = await request.text();
  if (!rawBody) {
    return null;
  }

  return JSON.parse(rawBody);
}

export async function GET() {
  // Only return non-sensitive configuration
  return NextResponse.json({
    projectName: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
    walletConfig: process.env.NEXT_PUBLIC_ONCHAINKIT_WALLET_CONFIG,
  });
}

// This endpoint will be used for authenticated requests that need API keys
export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);

    if (body?.message && body?.signature) {
      const siweMessage = new SiweMessage(body.message);
      const verification = await siweMessage.verify({
        signature: body.signature,
        domain: request.headers.get('host') || undefined,
      });

      if (!verification.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid wallet signature',
          },
          { status: 401 }
        );
      }

      const response = NextResponse.json({
        success: true,
        address: verification.data.address,
      });

      response.cookies.set('coinbase-ramp-demo-app-auth', 'true', {
        httpOnly: false,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });

      return response;
    }

    // Log environment variables for debugging (without exposing actual values)
    console.log('Environment variables in API route:', {
      walletConnectProjectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID
        ? 'Set'
        : 'Not set',
      onchainKitApiKey: process.env.ONCHAINKIT_API_KEY ? 'Set' : 'Not set',
      cdpProjectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID ? 'Set' : 'Not set',
    });

    // For Vercel deployment, make sure these environment variables are set
    // Using the correct variable names according to the documentation
    const walletConnectProjectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID || '';
    const onchainKitApiKey = process.env.ONCHAINKIT_API_KEY || '';
    const cdpProjectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID || '';

    // Check if any of the required environment variables are missing
    const missingVars = [];
    if (!walletConnectProjectId) missingVars.push('CDP_PROJECT_ID');
    if (!onchainKitApiKey) missingVars.push('ONCHAINKIT_API_KEY');
    if (!cdpProjectId) missingVars.push('CDP_PROJECT_ID');

    if (missingVars.length > 0) {
      console.warn('Missing environment variables:', missingVars);

      return NextResponse.json(
        {
          success: false,
          error: `Missing required environment variables: ${missingVars.join(
            ', '
          )}`,
          missingVars,
          config: {
            walletConnectProjectId,
            onchainKitApiKey,
            cdpProjectId,
          },
        },
        { status: 400 }
      );
    }

    // For demo purposes, we're just returning the config
    // In production, you would implement proper authentication
    return NextResponse.json({
      success: true,
      config: {
        walletConnectProjectId,
        onchainKitApiKey,
        cdpProjectId,
      },
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      },
      { status: 500 }
    );
  }
}
