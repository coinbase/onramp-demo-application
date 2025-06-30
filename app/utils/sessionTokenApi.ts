/**
 * Session Token API utilities for secure initialization
 */
import { generateJwt } from '@coinbase/cdp-sdk/auth';

interface SessionTokenRequest {
  addresses: Array<{
    address: string;
    blockchains: string[];
  }>;
  assets?: string[];
}

interface SessionTokenResponse {
  token: string;
  channel_id?: string;
}

/**
 * Generates a JWT token for CDP API authentication using the CDP SDK
 * @param keyName - The CDP API key name
 * @param keySecret - The CDP API private key
 * @returns Promise of signed JWT token
 */
export async function generateJWT(keyName: string, keySecret: string): Promise<string> {
  const requestMethod = 'POST';
  const requestHost = 'api.developer.coinbase.com';
  const requestPath = '/onramp/v1/token';
  
  try {
    // Use the CDP SDK to generate the JWT
    const token = await generateJwt({
      apiKeyId: keyName,
      apiKeySecret: keySecret,
      requestMethod: requestMethod,
      requestHost: requestHost,
      requestPath: requestPath,
      expiresIn: 120 // optional (defaults to 120 seconds)
    });
    
    return token;
  } catch (error) {
    console.error('Error generating JWT:', error);
    throw error;
  }
}

/**
 * Generates a session token for secure onramp/offramp initialization
 * @param params - The parameters for session token generation
 * @returns The session token or null if generation fails
 */
export async function generateSessionToken(
  params: SessionTokenRequest
): Promise<string | null> {
  try {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Session token generation failed:', error);
      throw new Error(error.error || 'Failed to generate session token');
    }

    const data: SessionTokenResponse = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error generating session token:', error);
    return null;
  }
}

/**
 * Helper function to format addresses for session token request
 * @param address - The wallet address
 * @param networks - Array of blockchain networks
 * @returns Formatted addresses array
 */
export function formatAddressesForToken(
  address: string,
  networks: string[]
): Array<{ address: string; blockchains: string[] }> {
  return [
    {
      address,
      blockchains: networks,
    },
  ];
}

/**
 * Example usage for developers
 * 
 * ```typescript
 * // Generate a session token for onramp
 * const token = await generateSessionToken({
 *   addresses: [{
 *     address: "0x1234567890123456789012345678901234567890",
 *     blockchains: ["ethereum", "base"]
 *   }],
 *   assets: ["ETH", "USDC"]
 * });
 * 
 * // Use the token in onramp URL
 * const onrampUrl = generateOnrampURL({
 *   sessionToken: token,
 *   // ... other params
 * });
 * ```
 */ 