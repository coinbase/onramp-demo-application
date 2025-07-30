"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { FundCardDemo } from "../components/FundCardDemo";
import { FundButton } from "../components/FundButton";
import { SimpleFundCard } from "../components/SimpleFundCard";
import { useCoinbaseRampTransaction } from "../contexts/CoinbaseRampTransactionContext";
import { CustomIntegrationDemo } from "../components/CustomIntegrationDemo";
import { useAccount } from "wagmi";
import { FundCard } from "@coinbase/onchainkit/fund";

export default function FundPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { selectedCountry, selectedSubdivision, selectedCurrency } =
    useCoinbaseRampTransaction();
  const { isConnected } = useAccount();

  // Fund Button configuration
  const [hideIcon, setHideIcon] = useState(false);
  const [hideText, setHideText] = useState(false);
  const [openIn, setOpenIn] = useState<"popup" | "tab">("popup");
  const [useCustomUrl, setUseCustomUrl] = useState(true);
  const [presetAmount, setPresetAmount] = useState(20);
  const [customText, setCustomText] = useState("Fund Project");

  // Fund Card configuration
  const [assetSymbol, setAssetSymbol] = useState("ETH");
  const [country, setCountry] = useState("US");
  const [currency, setCurrency] = useState("USD");
  const [headerText, setHeaderText] = useState("Purchase Ethereum");
  const [buttonText, setButtonText] = useState("Purchase");
  const [showPresetAmounts, setShowPresetAmounts] = useState(true);
  const [presetAmountInputs, setPresetAmountInputs] = useState<string[]>([
    "10",
    "20",
    "50",
  ]);

  // Available assets
  const assets = [
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "USDC", name: "USD Coin" },
    { symbol: "BTC", name: "Bitcoin" },
    { symbol: "SOL", name: "Solana" },
    { symbol: "MATIC", name: "Polygon" },
  ];

  // Available countries
  const countries = [
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
  ];

  // Available currencies
  const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "GBP", name: "British Pound" },
    { code: "EUR", name: "Euro" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "AUD", name: "Australian Dollar" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Modern hero section with gradient background */}
        <section className="relative overflow-hidden">
          {/* Modern gradient background */}
          <div className="absolute inset-0 bg-[#fafafa] dark:bg-[#111] z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-amber-50 dark:from-amber-900/30 dark:via-[#131313] dark:to-amber-900/30 opacity-80"></div>

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNmMWYxZjEiIGQ9Ik0zNiAxOGgtMnYyaDJ6TTQwIDE4aC0ydjJoMnpNNDQgMThoLTJ2Mmgyek0zNCAxNmgtMnYyaDJ6TTM4IDE2aC0ydjJoMnpNNDIgMTZoLTJ2Mmgyek0zMCAxNmgtMnYyaDJ6TTI2IDE2aC0ydjJoMnpNMjIgMTZoLTJ2Mmgyek0xOCAxNmgtMnYyaDJ6TDE0IDE2aC0ydjJoMnpNMTAgMTZIOHYyaDJ6TTYgMTZINHYyaDJ6Ii8+PC9nPjwvc3ZnPg==')] opacity-[0.15] dark:opacity-[0.05]"></div>
          </div>

          {/* Subtle gradient orb */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-amber-400 dark:bg-amber-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-float"></div>
          </div>

          <div className="container mx-auto px-4 pt-28 pb-16 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 mb-6">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                <span className="text-amber-700 dark:text-amber-300 text-sm font-medium whitespace-nowrap">
                  Powered by Coinbase Developer Platform
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 dark:from-amber-400 dark:via-yellow-400 dark:to-amber-400 tracking-tight">
                Fund with OnchainKit
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Integrate Coinbase's Fund Button and Fund Card features to
                enable crypto funding for your dApp or project with just a few
                lines of code.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8 max-w-3xl mx-auto">
                <p className="text-blue-700 dark:text-blue-300 text-sm md:text-base">
                  <span className="font-medium">Note:</span> Wallet connection
                  is required for Fund features to work. Connect your wallet to
                  test the functionality.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8 max-w-3xl mx-auto">
                <p className="text-red-700 dark:text-red-300 text-sm md:text-base">
                  <span className="font-medium">Important:</span> Solana is not
                  supported with Fund components. However, you can use the{" "}
                  <code className="bg-red-100 dark:bg-red-800 px-1 py-0.5 rounded">
                    getOnrampBuyUrl
                  </code>{" "}
                  utility to generate a custom URL client-side that supports
                  Solana.
                  <a
                    href="https://docs.base.org/builderkits/onchainkit/fund/get-onramp-buy-url"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 text-red-600 dark:text-red-400 hover:underline"
                  >
                    Learn how to use getOnrampBuyUrl for Solana →
                  </a>
                </p>
              </div>

              <Link
                href="https://docs.base.org/builderkits/onchainkit/fund/fund-button"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-10"
              >
                View Documentation <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Fund Card Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Fund Card
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  The Fund Card component provides a complete fiat onramp
                  experience within your app, including amount input, payment
                  method selection, and automatic exchange rate updates.
                </p>
                <div className="mt-4">
                  <a
                    href="https://docs.base.org/builderkits/onchainkit/fund/get-onramp-buy-url"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-amber-600 hover:text-amber-700"
                  >
                    <span>
                      Learn about customizing the onramp experience with
                      getOnrampBuyUrl
                    </span>
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      ></path>
                    </svg>
                  </a>
                </div>
                <div className="mt-4 mx-auto max-w-3xl">
                  <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      <span className="font-medium">Pro Tip:</span> Use the{" "}
                      <code className="bg-amber-100 dark:bg-amber-800 px-1 py-0.5 rounded">
                        getOnrampBuyUrl
                      </code>{" "}
                      utility to customize the onramp experience by:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                      <li>Specifying which assets are available to buy</li>
                      <li>Setting default networks for receiving crypto</li>
                      <li>Configuring preset amounts and currencies</li>
                      <li>
                        Adding custom redirect URLs for your application flow
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                  <h3 className="text-2xl font-bold mb-8 text-gray-900">
                    Configuration
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Asset
                      </label>
                      <div className="relative">
                        <select
                          value={assetSymbol}
                          onChange={(e) => setAssetSymbol(e.target.value)}
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10"
                        >
                          {assets.map((asset) => (
                            <option key={asset.symbol} value={asset.symbol}>
                              {asset.name} ({asset.symbol})
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <div className="relative">
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10"
                        >
                          {countries.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <div className="relative">
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10"
                        >
                          {currencies.map((currency) => (
                            <option key={currency.code} value={currency.code}>
                              {currency.name} ({currency.code})
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Header Text
                      </label>
                      <input
                        type="text"
                        value={headerText}
                        onChange={(e) => setHeaderText(e.target.value)}
                        placeholder="Purchase Ethereum"
                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                        placeholder="Purchase"
                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showPresetAmounts"
                        checked={showPresetAmounts}
                        onChange={() =>
                          setShowPresetAmounts(!showPresetAmounts)
                        }
                        className="w-5 h-5 mr-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="showPresetAmounts"
                        className="text-base text-gray-700 dark:text-gray-300"
                      >
                        Show Preset Amounts
                      </label>
                    </div>

                    {showPresetAmounts && (
                      <div>
                        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Preset Amounts (comma separated)
                        </label>
                        <input
                          type="text"
                          value={presetAmountInputs.join(", ")}
                          onChange={(e) => {
                            const values = e.target.value
                              .split(",")
                              .map((v) => v.trim());
                            setPresetAmountInputs(values);
                          }}
                          placeholder="10, 20, 50"
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 flex flex-col">
                  <h3 className="text-2xl font-bold mb-8 text-gray-900">
                    Preview
                  </h3>
                  <div className="flex-grow flex items-center justify-center">
                    {isConnected ? (
                      <div className="w-full max-w-sm">
                        <FundCard
                          assetSymbol={assetSymbol}
                          country={country}
                          currency={currency}
                          headerText={headerText}
                          buttonText={buttonText}
                          presetAmountInputs={
                            showPresetAmounts
                              ? (presetAmountInputs as any)
                              : undefined
                          }
                        />
                      </div>
                    ) : (
                      <div className="p-4 border rounded-lg bg-yellow-50 text-yellow-700">
                        Please connect your wallet to use the Fund Card
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fund Button Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Fund Button
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  The Fund Button component provides a simple way for users to
                  fund their wallet without leaving your app.
                </p>
                <div className="mt-4">
                  <a
                    href="https://docs.base.org/builderkits/onchainkit/fund/get-onramp-buy-url"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-amber-600 hover:text-amber-700"
                  >
                    <span>
                      Learn about customizing the onramp experience with
                      getOnrampBuyUrl
                    </span>
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      ></path>
                    </svg>
                  </a>
                </div>
                <div className="mt-4 mx-auto max-w-3xl">
                  <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      <span className="font-medium">Developer Note:</span> The
                      Fund Button can be enhanced with the{" "}
                      <code className="bg-amber-100 dark:bg-amber-800 px-1 py-0.5 rounded">
                        getOnrampBuyUrl
                      </code>{" "}
                      utility to:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                      <li>Generate custom URLs for specific user wallets</li>
                      <li>
                        Support additional networks not available in the
                        standard components
                      </li>
                      <li>
                        Create dynamic funding experiences based on user
                        preferences
                      </li>
                      <li>
                        Implement advanced tracking with custom parameters
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                  <h3 className="text-2xl font-bold mb-8 text-gray-900">
                    Configuration
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Custom Button Text
                      </label>
                      <input
                        type="text"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Fund Project"
                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hideIcon"
                        checked={hideIcon}
                        onChange={() => setHideIcon(!hideIcon)}
                        className="w-5 h-5 mr-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="hideIcon"
                        className="text-base text-gray-700 dark:text-gray-300"
                      >
                        Hide Icon
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hideText"
                        checked={hideText}
                        onChange={() => setHideText(!hideText)}
                        className="w-5 h-5 mr-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="hideText"
                        className="text-base text-gray-700 dark:text-gray-300"
                      >
                        Hide Text
                      </label>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Open In
                      </label>
                      <div className="relative">
                        <select
                          value={openIn}
                          onChange={(e) =>
                            setOpenIn(e.target.value as "popup" | "tab")
                          }
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10"
                        >
                          <option value="popup">Popup</option>
                          <option value="tab">New Tab</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="useCustomUrl"
                        checked={useCustomUrl}
                        onChange={() => setUseCustomUrl(!useCustomUrl)}
                        className="w-5 h-5 mr-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="useCustomUrl"
                        className="text-base text-gray-700"
                      >
                        Use Custom Onramp URL
                      </label>
                    </div>

                    {useCustomUrl && (
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">
                          Preset Amount ($)
                        </label>
                        <input
                          type="number"
                          value={presetAmount}
                          onChange={(e) =>
                            setPresetAmount(Number(e.target.value))
                          }
                          min="1"
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-100 flex flex-col">
                  <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
                    Preview
                  </h3>
                  <div className="flex-grow flex items-center justify-center">
                    <FundButton
                      customText={customText || undefined}
                      hideIcon={hideIcon}
                      hideText={hideText}
                      openIn={openIn}
                      useCustomUrl={useCustomUrl}
                      presetAmount={presetAmount}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Documentation Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 dark:text-white">
                Ready to Integrate?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Check out our comprehensive documentation to learn how to
                integrate Fund Button and Fund Card into your application.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="https://docs.base.org/builderkits/onchainkit/fund/fund-button"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Fund Button Docs
                </Link>
                <Link
                  href="https://docs.base.org/builderkits/onchainkit/fund/fund-card"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Fund Card Docs
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
