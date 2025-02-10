'use client';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { ReactNode } from 'react';
import { base } from 'viem/chains';

type Props = { children: ReactNode };

// const queryClient = new QueryClient();

export function OnchainProvider({ children }: Props) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      chain={base}
      projectId={process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID}
    >
      {children}
    </OnchainKitProvider>
  );
}
