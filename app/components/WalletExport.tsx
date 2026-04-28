'use client';
import { usePrivy, useSolanaWallets, useWallets } from '@privy-io/react-auth';
import { memo, useCallback, useState } from 'react';

const WalletExport = () => {
  const { login, user, logout, exportWallet } = usePrivy();
  const [loading, setLoading] = useState(false);

  const { wallets } = useWallets();
  const { wallets: solanaWallets, exportWallet: exportSolanaWallet } =
    useSolanaWallets();

  const handleLogOut = useCallback(async () => {
    setLoading(true);
    await logout();
    setLoading(false);
  }, [logout]);

  const handleLogIn = useCallback(async () => {
    setLoading(true);
    await login({
      loginMethods: ['google', 'github', 'discord', 'twitter'],
    });
    setLoading(false);
  }, [login]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-cds-bg-alternate p-4">
      <div className="cds-surface max-w-[600px] w-full p-6 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-cds-xl">
            <div className="flex flex-col items-center gap-4">
              <div
                className="cds-spinner"
                role="status"
                aria-label="Processing"
              ></div>
              <p className="text-cds-muted">Processing...</p>
            </div>
          </div>
        )}
        <div className="flex w-full justify-between items-center pb-4">
          <h1 className="text-2xl font-bold text-cds-fg">Wallet Export</h1>
          {user && (
            <button
              className="cds-button cds-button-secondary px-4 py-2 text-sm"
              onClick={handleLogOut}
              disabled={loading}
            >
              Log out
            </button>
          )}
        </div>
        <div className="border-t border-cds-line pt-6">
          {user ? (
            <div className="flex flex-col gap-6">
              <p className="text-cds-muted">
                Select a wallet to export its private key. Please ensure
                you&apos;re in a secure environment.
              </p>
              <div className="grid gap-4">
                {[...wallets, ...solanaWallets].map((wallet) => (
                  <div
                    key={wallet.address}
                    className="rounded-cds-lg border border-cds-line bg-cds-tertiary p-4"
                  >
                    <div className="flex flex-row justify-between items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-cds-muted">
                          Address
                        </p>
                        <p className="font-mono text-sm truncate max-w-[250px] text-cds-fg">
                          {wallet.address}
                        </p>
                        <p className="text-xs text-cds-muted mt-1">
                          Type: {wallet.type}
                        </p>
                      </div>
                      <button
                        className="cds-button cds-button-secondary px-4 py-2 text-sm"
                        onClick={async () => {
                          setLoading(true);
                          try {
                            if (wallet.type === 'solana') {
                              await exportSolanaWallet({
                                address: wallet.address,
                              });
                            } else {
                              await exportWallet({ address: wallet.address });
                            }
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                      >
                        Export
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2 text-cds-fg">
                  Authentication Required
                </h2>
                <p className="text-cds-muted">
                  Please authenticate to access your wallets
                </p>
              </div>
              <button
                className="cds-button cds-button-primary px-6 py-3"
                onClick={handleLogIn}
                disabled={loading}
              >
                Authenticate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(WalletExport);
