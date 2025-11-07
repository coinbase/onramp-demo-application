'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { CDPReactProvider } from '@coinbase/cdp-react';
import { ReactNode } from 'react';
import { base } from 'wagmi/chains';
import { CoinbaseRampTransactionProvider } from './contexts/CoinbaseRampTransactionContext';

export function Providers({ children }: { children: ReactNode }) {
  // ✅ Only use environment variables - NO hardcoded fallbacks
  const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY; // OnchainKit Client API Key (safe to expose)
  const projectName = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'Coinbase Ramp Demo';

  // ✅ Fail gracefully if required config is missing
  if (!projectId) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Missing NEXT_PUBLIC_CDP_PROJECT_ID environment variable');
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg border border-red-200">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">Configuration Error</h2>
          </div>
          <p className="text-gray-600 mb-4">
            The application is not properly configured. Please set the required environment variables.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
              <p className="font-medium mb-1">Missing:</p>
              <code className="text-xs">NEXT_PUBLIC_CDP_PROJECT_ID</code>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <CDPReactProvider
      config={{
        projectId: projectId,
        ethereum: {
          createOnLogin: 'eoa' // Create EOA wallet on login
        },
        appName: projectName
      }}
    >
      <CoinbaseRampTransactionProvider>
        <OnchainKitProvider
          chain={base}
          projectId={projectId}
          apiKey={apiKey} // OnchainKit Client API Key - required for Fund components
          config={{
            appearance: {
              name: projectName,
              theme: 'default',
              mode: 'light',
            },
          }}
        >
          {children}
        </OnchainKitProvider>
      </CoinbaseRampTransactionProvider>
    </CDPReactProvider>
  );
}
