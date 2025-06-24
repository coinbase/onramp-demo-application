/**
 * Session Token API utilities for secure initialization
 */
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

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
 * Formats a private key into proper PEM format
 * @param keySecret - The private key (base64 or PEM format)
 * @returns Properly formatted PEM private key
 */
export function formatPrivateKey(keySecret: string): string {
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

/**
 * Generates a JWT token for CDP API authentication
 * @param keyName - The CDP API key name
 * @param keySecret - The CDP API private key
 * @returns Signed JWT token
 */
export function generateJWT(keyName: string, keySecret: string): string {
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