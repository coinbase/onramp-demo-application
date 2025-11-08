"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useCoinbaseRampTransaction } from "../contexts/CoinbaseRampTransactionContext";
import { useSessionToken } from "../hooks/useSessionToken";
import { getOnrampBuyUrl } from "@coinbase/onchainkit/fund";

interface FundCardWithSessionTokenProps {
  assetSymbol?: string;
  country?: string;
  currency?: string;
  headerText?: string;
  buttonText?: string;
  presetAmountInputs?: readonly [string, string, string];
  defaultNetwork?: string;
}

/**
 * Custom FundCard implementation that supports session tokens
 * This is needed when "Enforce secure initialization" is enabled in CDP Dashboard
 * 
 * Note: The default OnchainKit <FundCard /> doesn't support session tokens directly,
 * so this is a custom implementation that generates session tokens server-side
 * and passes them in the funding URL.
 */
export function FundCardWithSessionToken({
  assetSymbol = "ETH",
  country = "US",
  currency = "USD",
  headerText = "Purchase Cryptocurrency",
  buttonText = "Purchase",
  presetAmountInputs = ["10", "20", "50"] as const,
  defaultNetwork = "base"
}: FundCardWithSessionTokenProps) {
  const { rampTransaction, authenticated } = useCoinbaseRampTransaction();

  // Only use embedded wallet address - do not fall back to wagmi wallet
  // This ensures users must connect with embedded wallet for fund features
  const address = authenticated ? rampTransaction?.wallet : undefined;
  const isConnected = authenticated && !!rampTransaction?.wallet;
  const [amount, setAmount] = useState(presetAmountInputs[1]); // Default to middle preset
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { generateToken, isGenerating } = useSessionToken();
  
  const cdpProjectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID || "";

  // Update amount when preset inputs change
  useEffect(() => {
    setAmount(presetAmountInputs[1]);
  }, [presetAmountInputs]);

  const handlePurchase = useCallback(async () => {
    if (!address || !cdpProjectId) {
      setError("Missing configuration");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Generate session token with specified networks
      const networks = [defaultNetwork];
      const sessionToken = await generateToken(address, networks);
      
      if (!sessionToken) {
        setError("Failed to generate session token");
        return;
      }

      // Generate funding URL with session token
      // ✅ When using sessionToken, do NOT include projectId, addresses, or assets
      // They are already encoded in the session token
      const url = getOnrampBuyUrl({
        sessionToken,
        presetFiatAmount: parseFloat(amount),
        fiatCurrency: currency,
        defaultNetwork: defaultNetwork,
      });

      // Open the funding URL
      window.open(url, "_blank");
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to initiate purchase");
    } finally {
      setIsLoading(false);
    }
  }, [address, cdpProjectId, amount, currency, defaultNetwork, generateToken]);

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto p-6 border rounded-xl bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800 text-center">
          <strong>Note:</strong> Fund Card requires CDP Embedded Wallet. Please sign in with your embedded wallet to continue.
        </p>
      </div>
    );
  }

  if (!cdpProjectId) {
    return (
      <div className="max-w-md mx-auto p-6 border rounded-xl bg-red-50 text-red-700">
        <p className="font-bold">Configuration Error</p>
        <p className="text-sm mt-1">CDP Project ID not configured</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">{headerText}</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount ({currency})
          </label>
          <div className="flex space-x-2 mb-2">
            {presetAmountInputs.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset)}
                className={`px-4 py-2 rounded-lg border ${
                  amount === preset
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                }`}
              >
                {currency === "USD" ? "$" : ""}
                {preset}
                {currency !== "USD" ? ` ${currency}` : ""}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter amount"
          />
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Asset:</span>
            <span className="font-medium text-gray-900">{assetSymbol}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Network:</span>
            <span className="font-medium text-gray-900 capitalize">{defaultNetwork}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Country:</span>
            <span className="font-medium text-gray-900">{country}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={handlePurchase}
          disabled={isLoading || isGenerating || !amount}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            isLoading || isGenerating || !amount
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isLoading || isGenerating ? "Generating secure session..." : buttonText}
        </button>

        <div className="mt-3 text-xs text-gray-500 text-center">
          🔒 Secured with session tokens
        </div>
      </div>
    </div>
  );
}
