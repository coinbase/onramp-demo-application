"use client";

import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";
import {
  SignInModal,
  SignInModalTrigger,
} from "@coinbase/cdp-react/components/SignInModal";
import {
  ExportWalletModal,
  ExportWalletModalContent,
} from "@coinbase/cdp-react";
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
  buttonStyle,
}: EmbeddedWalletAuthProps) => {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const { signOut } = useSignOut();
  const [copied, setCopied] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

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
      setIsWalletMenuOpen(false);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportPrivateKey = () => {
    setIsWalletMenuOpen(false);
    setIsExportOpen(true);
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
        <div className="relative">
          <button
            type="button"
            className="wallet-address-trigger"
            onClick={() => setIsWalletMenuOpen((isOpen) => !isOpen)}
            aria-expanded={isWalletMenuOpen}
            aria-haspopup="menu"
          >
            <span className="w-2 h-2 bg-cds-positive rounded-full"></span>
            <span className="font-mono text-sm text-cds-muted">
              {truncateAddress(evmAddress)}
            </span>
            <svg
              className={`cds-icon w-4 h-4 transition-transform ${
                isWalletMenuOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isWalletMenuOpen && (
            <div className="wallet-address-menu" role="menu">
              <button
                type="button"
                className="wallet-address-menu-item"
                onClick={handleCopyAddress}
                role="menuitem"
              >
                <span>{copied ? "Address copied" : "Copy address"}</span>
                <svg
                  className="cds-icon w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="wallet-address-menu-item"
                onClick={handleExportPrivateKey}
                role="menuitem"
              >
                <span>Export private key</span>
                <svg
                  className="cds-icon w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v-6m0 6l-3-3m3 3l3-3M5 19h14"
                  />
                </svg>
              </button>
            </div>
          )}

          <ExportWalletModal
            address={evmAddress}
            open={isExportOpen}
            setIsOpen={setIsExportOpen}
          >
            <ExportWalletModalContent title="Export private key" />
          </ExportWalletModal>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="cds-button cds-button-secondary px-4 py-2 text-sm"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div>
      <AuthButton
        className="embedded-wallet-auth"
        signInModal={({ open, setIsOpen, onSuccess }) => (
          <SignInModal open={open} setIsOpen={setIsOpen} onSuccess={onSuccess}>
            <SignInModalTrigger
              className={buttonStyle || "embedded-wallet-sign-in"}
              label="Sign in"
            />
          </SignInModal>
        )}
      />
    </div>
  );
};

export default EmbeddedWalletAuth;
