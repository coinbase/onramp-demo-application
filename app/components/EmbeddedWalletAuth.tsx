"use client";

import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";
import { useIsSignedIn, useEvmAddress, useSignOut } from "@coinbase/cdp-hooks";
import { useEffect, useState } from "react";
import { useCoinbaseRampTransaction } from "../contexts/CoinbaseRampTransactionContext";

interface EmbeddedWalletAuthProps {
  hideAddress?: boolean;
  hideEns?: boolean;
  buttonStyle?: string;
}

export const EmbeddedWalletAuth = ({
  hideAddress = false,
  hideEns = false,
  buttonStyle,
}: EmbeddedWalletAuthProps) => {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const { signOut } = useSignOut();
  const [copied, setCopied] = useState(false);

  const {
    setRampTransaction,
    rampTransaction,
    setAuthenticated,
  } = useCoinbaseRampTransaction();

  // Sync authenticated state with embedded wallet
  useEffect(() => {
    if (isSignedIn && evmAddress) {
      setAuthenticated(true);
      setRampTransaction({
        ...rampTransaction,
        wallet: evmAddress,
      });
    } else {
      setAuthenticated(false);
      setRampTransaction({
        ...rampTransaction,
        wallet: undefined,
      });
    }
  }, [isSignedIn, evmAddress]);

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = async () => {
    if (evmAddress) {
      await navigator.clipboard.writeText(evmAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setAuthenticated(false);
    setRampTransaction({
      ...rampTransaction,
      wallet: undefined,
    });
  };

  if (isSignedIn && evmAddress && !hideAddress) {
    return (
      <div className="flex items-center gap-3">
        {/* Wallet Address Display */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
              {truncateAddress(evmAddress)}
            </span>
          </div>
          
          {/* Copy Button */}
          <button
            onClick={handleCopyAddress}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Copy address"
          >
            {copied ? (
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div>
      <AuthButton className={buttonStyle} />
    </div>
  );
};

export default EmbeddedWalletAuth;
