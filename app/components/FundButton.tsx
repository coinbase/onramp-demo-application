"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FundButton as CoinbaseFundButton,
  getOnrampBuyUrl,
} from "@coinbase/onchainkit/fund";
import { useAccount } from "wagmi";
import { useSessionToken } from "../hooks/useSessionToken";

interface FundButtonProps {
  customText?: string;
  hideIcon?: boolean;
  hideText?: boolean;
  openIn?: "popup" | "tab";
  useCustomUrl?: boolean;
  presetAmount?: number;
}

export function FundButton({
  customText,
  hideIcon = false,
  hideText = false,
  openIn = "popup",
  useCustomUrl = false,
  presetAmount = 20,
}: FundButtonProps) {
  const { address, isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [fundingUrl, setFundingUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { generateToken, isGenerating } = useSessionToken();
  
  const cdpProjectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID || "";

  // Generate funding URL with session token
  const generateFundingUrl = useCallback(async () => {
    if (!address || !cdpProjectId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Generate session token
      const sessionToken = await generateToken(address, ["base"]);
      
      if (!sessionToken) {
        setError("Failed to generate session token");
        return;
      }

      // Generate funding URL with session token
      // ✅ When using sessionToken, do NOT include projectId, addresses, or assets
      // They are already encoded in the session token
      const url = getOnrampBuyUrl({
        sessionToken,
        presetFiatAmount: presetAmount,
        fiatCurrency: "USD",
      });

      setFundingUrl(url);
    } catch (err) {
      console.error("Error generating funding URL:", err);
      setError("Failed to generate funding URL");
    } finally {
      setIsLoading(false);
    }
  }, [address, cdpProjectId, presetAmount, generateToken]);

  // Generate funding URL when component mounts or address changes
  useEffect(() => {
    if (isConnected && address && cdpProjectId) {
      generateFundingUrl();
    }
  }, [isConnected, address, cdpProjectId, generateFundingUrl]);

  if (isLoading || isGenerating) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-center">Generating secure session...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50 text-yellow-700">
        Please connect your wallet to use the Fund Button
      </div>
    );
  }

  if (!cdpProjectId) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 text-red-700">
        <p className="font-bold">Configuration Error</p>
        <p className="text-sm mt-1">
          CDP Project ID is not available. Please check your environment variables.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 text-red-700">
        <p className="font-bold">Error</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={generateFundingUrl}
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-3">Fund Your Wallet</h3>
      <p className="text-gray-600 mb-4">
        Add funds to your wallet directly from this app with secure session tokens.
      </p>

      <div className="flex flex-col space-y-4">
        <div>
          <CoinbaseFundButton
            text={customText}
            hideIcon={hideIcon}
            hideText={hideText}
            openIn={openIn}
            fundingUrl={fundingUrl}
          />
        </div>

        <div className="text-xs text-gray-500 mt-2">
          🔒 Using secure session tokens | Preset amount: ${presetAmount}
        </div>
      </div>
    </div>
  );
}
