import { useState, useCallback } from 'react';
import { logger } from '../utils/logger';

interface UseSessionTokenReturn {
  generateToken: (address: string, blockchains: string[]) => Promise<string | null>;
  isGenerating: boolean;
  error: string | null;
}

export function useSessionToken(): UseSessionTokenReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateToken = useCallback(async (
    address: string,
    blockchains: string[]
  ): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addresses: [{
            address,
            blockchains
          }]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate session token');
      }

      const data = await response.json();
      return data.token;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('Session token generation failed', { error: err });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateToken,
    isGenerating,
    error
  };
}
