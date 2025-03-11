'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import WalletExport from '../components/WalletExport';

export default function WalletExportPage() {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID}
    >
      <WalletExport />
    </PrivyProvider>
  );
}
