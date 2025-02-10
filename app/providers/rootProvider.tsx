'use client';

import { CoinbaseRampTransactionProvider } from '../contexts/CoinbaseRampTransactionContext';
import { NextUiProvider } from './nextuiProvider';
import { OnchainProvider } from './onchainProvider';
import { QueryClientProvider } from './queryClientProvider';
import { WagmiProvider } from './wagmiProvider';

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <OnchainProvider>
        <NextUiProvider>
          <QueryClientProvider>
            <CoinbaseRampTransactionProvider>
              {children}
            </CoinbaseRampTransactionProvider>
          </QueryClientProvider>
        </NextUiProvider>
      </OnchainProvider>
    </WagmiProvider>
  );
}
