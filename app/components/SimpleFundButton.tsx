"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FundButton, getOnrampBuyUrl } from "@coinbase/onchainkit/fund";
import { useAccount } from "wagmi";
import { useSessionToken } from "../hooks/useSessionToken";

export function SimpleFundButton() {
  const { address, isConnected, chainId } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fundingUrl, setFundingUrl] = useState<string | undefined>(undefined);
  const { generateToken, isGenerating } = useSessionToken();

  // Access CDP Project ID directly from environment variables
  const cdpProjectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID || "";

  // Generate funding URL with session token
  const generateFundingUrl = useCallback(async () => {
    if (!address || !cdpProjectId) {
      console.log("Cannot generate funding URL:", {
        address: !!address,
        cdpProjectId: !!cdpProjectId,
      });
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
        presetFiatAmount: 20,
        fiatCurrency: "USD",
      });

      console.log("Generated funding URL successfully");
      setFundingUrl(url);
    } catch (err) {
      console.error("Error generating funding URL:", err);
      setError("Failed to generate funding URL");
    } finally {
      setIsLoading(false);
    }
  }, [address, cdpProjectId, generateToken]);

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
        <p className="text-sm mt-1">CDP Project ID not configured</p>
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
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-4">Simple Fund Button</h2>
      <div className="mb-4 text-sm text-gray-600">
        <p>Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
        <p>Chain ID: {chainId}</p>
      </div>
      <div className="flex flex-col space-y-4">
        <FundButton text="Fund Now" fundingUrl={fundingUrl} />
        {fundingUrl && (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.open(fundingUrl, "_blank")}
          >
            Open Funding URL Directly
          </button>
        )}
      </div>
    </div>
  );
}
