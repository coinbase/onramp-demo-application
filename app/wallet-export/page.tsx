'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import WalletExport from '../components/WalletExport';

// Force dynamic rendering to avoid build-time errors with missing env vars
export const dynamic = 'force-dynamic';

export default function WalletExportPage() {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  
  // Show message if Privy app ID is not configured
  if (!privyAppId) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-xl font-bold text-yellow-900 mb-2">Configuration Required</h2>
          <p className="text-yellow-800">
            Privy app ID is not configured. Please set <code className="bg-yellow-100 px-1 py-0.5 rounded">NEXT_PUBLIC_PRIVY_APP_ID</code> in your environment variables to use the wallet export feature.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <PrivyProvider
      appId={privyAppId}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID}
    >
      <WalletExport />
    </PrivyProvider>
  );
}
