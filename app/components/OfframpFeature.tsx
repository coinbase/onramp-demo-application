"use client";

import React, { useState, useEffect } from "react";
import { Banner } from "@coinbase/cds-web/banner";
import { Button } from "@coinbase/cds-web/buttons";
import { ContentCard, ContentCardBody } from "@coinbase/cds-web/cards";
import { Box, HStack, VStack } from "@coinbase/cds-web/layout";
import { SegmentedTabs } from "@coinbase/cds-web/tabs";
import { Text } from "@coinbase/cds-web/typography";
import { useCoinbaseRampTransaction } from "../contexts/CoinbaseRampTransactionContext";
import {
  fetchSellConfig,
  fetchSellOptions,
  Country,
  CryptoAsset,
} from "../utils/offrampApi";
import { useSearchParams } from "next/navigation";
import OfframpNotification from "./OfframpNotification";
import GeneratedLinkModal from "./GeneratedLinkModal";
import { CdsSelectField, CdsTextField } from "./CdsFormField";

// Define types for cashout methods
interface CashoutMethod {
  id: string;
  name: string;
}

// Define types for network
interface Network {
  id: string;
  name: string;
}

// Define types for cashout method option
interface CashoutMethodOption {
  id: string;
  name: string;
  limits: Record<string, { min: string; max: string }>;
}

// Define types for fiat currency
interface FiatCurrency {
  code: string;
  name: string;
  cashout_methods: CashoutMethodOption[];
}

// Define asset-network compatibility mapping
const assetNetworkMap: Record<string, string[]> = {
  ETH: ["ethereum", "base", "optimism", "arbitrum", "polygon"],
  USDC: [
    "ethereum",
    "base",
    "optimism",
    "arbitrum",
    "polygon",
    "solana",
    "avalanche-c-chain",
    "unichain",
    "aptos",
    "bnb-chain",
  ],
  BTC: ["bitcoin"],
  SOL: ["solana"],
  MATIC: ["polygon", "ethereum"],
  AVAX: ["avalanche-c-chain", "ethereum"],
  LINK: ["ethereum", "base", "arbitrum"],
  UNI: ["ethereum", "polygon"],
  DOGE: ["dogecoin"],
  SHIB: ["ethereum"],
  XRP: ["ripple"],
  LTC: ["litecoin"],
  BCH: ["bitcoin-cash"],
};

// Define supported networks (expanded list)
const networks = [
  { id: "ethereum", name: "Ethereum" },
  { id: "base", name: "Base" },
  { id: "optimism", name: "Optimism" },
  { id: "polygon", name: "Polygon" },
  { id: "arbitrum", name: "Arbitrum" },
  { id: "avalanche-c-chain", name: "Avalanche" },
  { id: "solana", name: "Solana" },
  { id: "bitcoin", name: "Bitcoin" },
  { id: "bitcoin-lightning", name: "Bitcoin Lightning" },
  { id: "cardano", name: "Cardano" },
  { id: "polkadot", name: "Polkadot" },
  { id: "cosmos", name: "Cosmos" },
  { id: "near", name: "NEAR Protocol" },
  { id: "flow", name: "Flow" },
  { id: "hedera", name: "Hedera" },
  { id: "algorand", name: "Algorand" },
  { id: "tezos", name: "Tezos" },
  { id: "stellar", name: "Stellar" },
  { id: "tron", name: "TRON" },
  { id: "filecoin", name: "Filecoin" },
  { id: "binance-smart-chain", name: "BNB Chain" },
  { id: "bnb-chain", name: "BNB Chain" },
  { id: "binance-chain", name: "Binance Chain" },
  { id: "fantom", name: "Fantom" },
  { id: "cronos", name: "Cronos" },
  { id: "gnosis", name: "Gnosis" },
  { id: "celo", name: "Celo" },
  { id: "moonbeam", name: "Moonbeam" },
  { id: "harmony", name: "Harmony" },
  { id: "unichain", name: "Unichain" },
  { id: "aptos", name: "Aptos" },
  { id: "ripple", name: "XRP Ledger" },
  { id: "dogecoin", name: "Dogecoin" },
  { id: "litecoin", name: "Litecoin" },
  { id: "bitcoin-cash", name: "Bitcoin Cash" },
].sort((a, b) => a.name.localeCompare(b.name));

// US States list
const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
];

export default function OfframpFeature() {
  const { rampTransaction, authenticated } = useCoinbaseRampTransaction();

  // Only use embedded wallet address - do not fall back to wagmi wallet
  // This ensures users must connect with embedded wallet for offramp
  const address = authenticated ? rampTransaction?.wallet : undefined;
  const isConnected = authenticated && !!rampTransaction?.wallet;
  const [selectedAsset, setSelectedAsset] = useState("USDC");
  const [amount, setAmount] = useState("10");
  const [selectedNetwork, setSelectedNetwork] = useState("base");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [selectedSubdivision, setSelectedSubdivision] = useState("CA");
  const [availableAssets, setAvailableAssets] = useState<CryptoAsset[]>([]);
  const [availableNetworks, setAvailableNetworks] = useState<Network[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCashoutCurrency, setSelectedCashoutCurrency] = useState("USD");
  const [selectedCashoutMethod, setSelectedCashoutMethod] = useState("");
  const [cashoutMethods, setCashoutMethods] = useState<CashoutMethodOption[]>(
    []
  );
  const [cashoutCurrencies, setCashoutCurrencies] = useState<FiatCurrency[]>(
    []
  );
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  // Default assets if API fails
  const defaultAssets: CryptoAsset[] = [
    {
      code: "USDC",
      name: "USD Coin",
      networks: [
        { id: "ethereum", name: "Ethereum" },
        { id: "base", name: "Base" },
        { id: "optimism", name: "Optimism" },
        { id: "polygon", name: "Polygon" },
        { id: "arbitrum", name: "Arbitrum" },
        { id: "solana", name: "Solana" },
        { id: "avalanche-c-chain", name: "Avalanche" },
        { id: "unichain", name: "Unichain" },
        { id: "aptos", name: "Aptos" },
        { id: "bnb-chain", name: "BNB Chain" },
      ],
    },
    {
      code: "ETH",
      name: "Ethereum",
      networks: [
        { id: "ethereum", name: "Ethereum" },
        { id: "base", name: "Base" },
        { id: "optimism", name: "Optimism" },
        { id: "arbitrum", name: "Arbitrum" },
      ],
    },
    {
      code: "BTC",
      name: "Bitcoin",
      networks: [{ id: "bitcoin", name: "Bitcoin" }],
    },
  ];

  // Default cashout currencies if API fails
  const defaultCashoutCurrencies: FiatCurrency[] = [
    {
      code: "USD",
      name: "US Dollar",
      cashout_methods: [
        {
          id: "ACH_BANK_ACCOUNT",
          name: "Bank Transfer (ACH)",
          limits: {
            USD: { min: "10", max: "25000" },
          },
        },
        {
          id: "PAYPAL",
          name: "PayPal",
          limits: {
            USD: { min: "10", max: "5000" },
          },
        },
        {
          id: "FIAT_WALLET",
          name: "Coinbase Fiat Wallet",
          limits: {
            USD: { min: "1", max: "50000" },
          },
        },
        {
          id: "RTP",
          name: "Real-Time Payments (RTP)",
          limits: {
            USD: { min: "10", max: "5000" },
          },
        },
      ],
    },
    {
      code: "EUR",
      name: "Euro",
      cashout_methods: [
        {
          id: "SEPA_BANK_ACCOUNT",
          name: "SEPA Bank Transfer",
          limits: {
            EUR: { min: "10", max: "25000" },
          },
        },
      ],
    },
  ];

  // Core states
  const [activeTab, setActiveTab] = useState<"api" | "url">("api");
  const integrationTabs = [
    { id: "api", label: "Offramp API" },
    { id: "url", label: "One-time Payment Link" },
  ] as const;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState<boolean>(false);

  // Data states
  const [countries, setCountries] = useState<Country[]>([]);
  const [subdivisions, setSubdivisions] = useState<string[]>([]);

  // Check for status in URL
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  // Show notification if returning from Coinbase with a status
  useEffect(() => {
    // Log all URL parameters for debugging
    const allParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      allParams[key] = value;
    });
    
    if (Object.keys(allParams).length > 0) {
      console.log("\n═══════════════════════════════════════════════════════");
      console.log("🔙 Returned from Coinbase Offramp");
      console.log("═══════════════════════════════════════════════════════");
      console.log("URL Parameters received:", allParams);
      
      if (status) {
        console.log("✅ Transaction Status:", status);
        setShowNotification(true);
      } else {
        console.log("⚠️  No status parameter received");
        console.log("\nThis usually means one of the following:");
        console.log("\n🔑 MOST COMMON - Coinbase Account Issue:");
        console.log("  • You don't have a Coinbase account");
        console.log("  • Your bank account/payment method is not linked in Coinbase");
        console.log("  • Your identity is not verified in your Coinbase account");
        console.log("  • Guest checkout was attempted (not supported for offramp)");
        console.log("\n💰 Wallet Balance Issue:");
        console.log("  • Insufficient funds in your connected wallet");
        console.log("  • Asset is on wrong network");
        console.log("\n❌ Other Reasons:");
        console.log("  • Transaction was cancelled");
        console.log("  • Network/connectivity issue");
        console.log("\n📋 Action Required:");
        console.log("  1. Create/login to Coinbase account at coinbase.com");
        console.log("  2. Complete identity verification");
        console.log("  3. Link your bank account or PayPal");
        console.log("  4. Ensure you have crypto in your wallet");
        console.log("  5. Try the transaction again");
        setShowNotification(true);
      }
      console.log("═══════════════════════════════════════════════════════\n");
    }
  }, [status, searchParams]);

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const config = await fetchSellConfig();
        if (config && config.countries) {
          setCountries(config.countries);

          // Set subdivisions for US
          const usCountry = config.countries.find((c) => c.code === "US");
          if (usCountry && usCountry.supported_states) {
            setSubdivisions(usCountry.supported_states);
          }
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  // Fetch assets and networks when country or subdivision changes
  useEffect(() => {
    if (!selectedCountry) return;
    fetchAssets();
  }, [selectedCountry, selectedSubdivision]);

  // Fetch assets and networks from API
  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const options = await fetchSellOptions(
        selectedCountry,
        selectedSubdivision
      );

      // Set available assets from API response
      if (options.sell_currencies && options.sell_currencies.length > 0) {
        setAvailableAssets(options.sell_currencies);

        // Check if USDC is available in the response
        const usdcAsset = options.sell_currencies.find(
          (a) => a.code === "USDC"
        );

        // Only update the selected asset if USDC is not available
        if (!usdcAsset) {
          const initialAsset = options.sell_currencies[0].code;
          setSelectedAsset(initialAsset);

          // Find networks for the selected asset from API response
          const assetNetworksFromApi =
            options.sell_currencies.find((a) => a.code === initialAsset)
              ?.networks || [];

          // Merge API networks with our predefined networks to ensure we have all needed networks
          const mergedNetworks = networks.filter((network) =>
            assetNetworkMap[initialAsset]?.includes(network.id)
          );

          setAvailableNetworks(mergedNetworks);

          // Set initial network that's compatible with the asset
          if (
            assetNetworkMap[initialAsset] &&
            assetNetworkMap[initialAsset].length > 0
          ) {
            setSelectedNetwork(assetNetworkMap[initialAsset][0]);
          } else if (mergedNetworks.length > 0) {
            setSelectedNetwork(mergedNetworks[0].id);
          }
        } else {
          // USDC is available, ensure we have the correct networks for it
          const mergedNetworks = networks.filter((network) =>
            assetNetworkMap["USDC"]?.includes(network.id)
          );

          setAvailableNetworks(mergedNetworks);

          // Keep Base as the selected network if it's compatible with USDC
          if (!assetNetworkMap["USDC"]?.includes("base")) {
            // If Base is not compatible with USDC, select the first compatible network
            setSelectedNetwork(assetNetworkMap["USDC"][0]);
          }
        }
      }

      // Set available cashout methods from API response
      if (options.cashout_currencies && options.cashout_currencies.length > 0) {
        setCashoutCurrencies(options.cashout_currencies);

        // Prefer USD as the cashout currency
        const usdCurrency =
          options.cashout_currencies.find((c) => c.code === "USD") ||
          options.cashout_currencies[0];
        setSelectedCashoutCurrency(usdCurrency.code);

        // Set available cashout methods for the selected currency
        if (
          usdCurrency.cashout_methods &&
          usdCurrency.cashout_methods.length > 0
        ) {
          setCashoutMethods(usdCurrency.cashout_methods);

          // Prefer ACH_BANK_ACCOUNT as the cashout method for USD
          const achMethod = usdCurrency.cashout_methods.find(
            (m) => m.id === "ACH_BANK_ACCOUNT"
          );
          setSelectedCashoutMethod(
            achMethod ? achMethod.id : usdCurrency.cashout_methods[0].id
          );
        }
      }
    } catch (error) {
      console.error("Error fetching sell options:", error);
      // Use default values if API fails
      setAvailableAssets(defaultAssets);

      // Set USDC as the default asset
      setSelectedAsset("USDC");

      // Set networks for USDC
      const mergedNetworks = networks.filter((network) =>
        assetNetworkMap["USDC"]?.includes(network.id)
      );
      setAvailableNetworks(mergedNetworks);

      // Set Base as the default network
      setSelectedNetwork("base");

      // Set default cashout currencies and methods
      setCashoutCurrencies(defaultCashoutCurrencies);
      setSelectedCashoutCurrency("USD");

      // Find ACH_BANK_ACCOUNT method for USD
      const usdCurrency = defaultCashoutCurrencies.find(
        (c) => c.code === "USD"
      );
      if (usdCurrency && usdCurrency.cashout_methods) {
        setCashoutMethods(usdCurrency.cashout_methods);
        const achMethod = usdCurrency.cashout_methods.find(
          (m) => m.id === "ACH_BANK_ACCOUNT"
        );
        setSelectedCashoutMethod(
          achMethod ? achMethod.id : usdCurrency.cashout_methods[0].id
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize network based on selected asset
  useEffect(() => {
    // Ensure the selected network is compatible with the selected asset
    if (assetNetworkMap[selectedAsset]) {
      const compatibleNetworks = assetNetworkMap[selectedAsset];
      if (!compatibleNetworks.includes(selectedNetwork)) {
        setSelectedNetwork(compatibleNetworks[0]); // Set to first compatible network
      }
    }
  }, [selectedAsset, selectedNetwork]);

  // Handle asset change
  const handleAssetChange = (assetCode: string) => {
    setSelectedAsset(assetCode);

    // Update network based on the selected asset
    if (assetNetworkMap[assetCode]) {
      const compatibleNetworks = assetNetworkMap[assetCode];

      // Filter our predefined networks to only include those compatible with the asset
      const filteredNetworks = networks.filter((network) =>
        compatibleNetworks.includes(network.id)
      );

      setAvailableNetworks(filteredNetworks);

      // If current network is not compatible with the new asset, update it
      if (!compatibleNetworks.includes(selectedNetwork)) {
        setSelectedNetwork(compatibleNetworks[0]);
      }
    }
  };

  // Handle offramp using Sell Quote API
  const handleOfframp = async () => {
    // Clear any previous error
    setErrorMessage(null);

    if (!authenticated) {
      setErrorMessage("Please sign in with your CDP Embedded Wallet to use offramp");
      return;
    }

    if (!address) {
      setErrorMessage("No wallet address found. Please ensure you're signed in with your embedded wallet");
      return;
    }

    if (!isConnected) {
      setErrorMessage("Please connect your embedded wallet first");
      return;
    }

    if (!selectedCashoutMethod) {
      setErrorMessage("Please select a cashout method");
      return;
    }

    try {
      setIsGeneratingToken(true);

      // Generate session token for secure offramp
      const sessionTokenResponse = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addresses: [{
            address: address,
            blockchains: [selectedNetwork],
          }],
        }),
      });

      if (!sessionTokenResponse.ok) {
        throw new Error('Failed to generate session token');
      }

      const { token: sessionToken } = await sessionTokenResponse.json();

      if (!sessionToken) {
        throw new Error('No session token received');
      }

      // Build offramp URL with session token and default values
      // This shows the input/validation screen instead of skipping to confirmation
      const offrampUrl = new URL('https://pay.coinbase.com/v3/sell/input');
      offrampUrl.searchParams.set('sessionToken', sessionToken);
      offrampUrl.searchParams.set('partnerUserId', address.substring(0, 49));
      offrampUrl.searchParams.set('redirectUrl', `${window.location.origin}/offramp`);
      offrampUrl.searchParams.set('defaultAsset', selectedAsset);
      offrampUrl.searchParams.set('defaultNetwork', selectedNetwork);
      offrampUrl.searchParams.set('defaultCashoutMethod', selectedCashoutMethod);
      offrampUrl.searchParams.set('fiatCurrency', selectedCashoutCurrency);

      console.log("🚀 Opening Coinbase offramp page...");
      console.log("📝 Offramp URL with validation:", offrampUrl.toString());
      console.log("ℹ️  URL includes: sessionToken, defaultAsset, defaultNetwork, defaultPaymentMethod");
      console.log("\n═══════════════════════════════════════════════════════");
      console.log("⚠️  CRITICAL: Offramp Transaction Requirements");
      console.log("═══════════════════════════════════════════════════════");
      console.log("🔑 COINBASE ACCOUNT REQUIRED:");
      console.log("  ⚠️  You MUST have a Coinbase account with linked bank details");
      console.log("  ⚠️  Guest checkout is NOT supported for fiat withdrawals");
      console.log(`  ⚠️  Your selected payment method (${selectedCashoutMethod}) must be linked to your Coinbase account`);
      console.log("\n✓ WALLET REQUIREMENTS:");
      console.log(`  • Asset must be on ${selectedNetwork} network`);
      console.log(`  • Wallet address: ${address}`);
      console.log("\n💡 Balance Validation:");
      console.log("  • The offramp screen will show your available balance");
      console.log("  • You'll see an error if you don't have enough funds");
      console.log("\n🔄 You'll be redirected back here after the transaction");
      console.log("═══════════════════════════════════════════════════════\n");

      // Open the offramp URL
      window.open(offrampUrl.toString(), "_blank");
    } catch (error) {
      console.error('Error creating offramp:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create offramp. Please try again.');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Generate one-time URL using Sell Quote API
  const handleGenerateUrl = async () => {
    if (!authenticated) {
      setErrorMessage("Please sign in with your CDP Embedded Wallet to use offramp");
      return;
    }

    if (!address) {
      setErrorMessage("No wallet address found. Please ensure you're signed in with your embedded wallet");
      return;
    }

    if (!selectedCashoutMethod) {
      setErrorMessage("Please select a cashout method");
      return;
    }

    try {
      setIsGeneratingToken(true);

      // Call Sell Quote API to get ready-to-use offramp URL
      const response = await fetch('/api/sell-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellCurrency: selectedAsset,
          sellAmount: amount,
          sellNetwork: selectedNetwork,
          cashoutCurrency: selectedCashoutCurrency,
          paymentMethod: selectedCashoutMethod,
          country: selectedCountry,
          subdivision: selectedCountry === 'US' ? selectedSubdivision : undefined,
          sourceAddress: address,
          redirectUrl: window.location.origin + "/offramp",
          partnerUserId: address.substring(0, 49), // Use wallet address as user ID
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Sell Quote API error response:', error);
        const errorMsg = error.details || error.error || 'Failed to generate offramp quote';
        const hint = error.hint ? `\n${error.hint}` : '';
        throw new Error(errorMsg + hint);
      }

      const data = await response.json();

      console.log('✅ Sell quote response received for URL generation:', data);

      // Check if offramp_url is present in response
      if (!data.offramp_url) {
        throw new Error('No offramp URL in response');
      }

      console.log("✨ Generated offramp URL:", data.offramp_url);
      console.log("💡 Note: Recipients will need actual", selectedAsset, "in their wallet to complete this transaction");

      setGeneratedUrl(data.offramp_url);
      setShowUrlModal(true);
    } catch (error) {
      console.error('Error generating offramp URL:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate offramp URL. Please try again.');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Handle copy URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(generatedUrl);
    alert("URL copied to clipboard!");
  };

  // Handle open URL
  const handleOpenUrl = () => {
    window.open(generatedUrl, "_blank");
  };

  // Get the selected asset name for display
  const getSelectedAssetName = () => {
    const asset = availableAssets.find((a) => a.code === selectedAsset);
    return asset ? asset.name : selectedAsset;
  };

  // Get the selected network name for display
  const getSelectedNetworkName = () => {
    const network = availableNetworks.find((n) => n.id === selectedNetwork);
    return network ? network.name : selectedNetwork;
  };

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Demo Info Banner */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  How Offramp Works
                </p>
                <div className="text-sm text-blue-800 mt-2 space-y-2">
                  <p>
                    <strong>1. You need crypto in your wallet:</strong> Make sure your connected wallet has the crypto asset you want to sell on the correct network before starting an offramp transaction.
                  </p>
                  <p>
                    <strong>2. Coinbase account required:</strong> Unlike onramp, offramp does NOT support guest checkout. You must have a Coinbase account with verified identity and a linked payment method (bank account, PayPal, etc.).
                  </p>
                  <p>
                    <strong>3. Balance validation:</strong> Coinbase will check your wallet balance and show available funds. If you see "No assets available", you need to fund your wallet first.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configuration Box */}
            <ContentCard className="cds-card p-8">
              <ContentCardBody
                title={<Text as="h3" font="title3">Configure Your Offramp</Text>}
              >

              {/* Tab Selection */}
              <div className="mb-6">
                <SegmentedTabs
                  accessibilityLabel="Switch offramp integration method"
                  activeTab={integrationTabs.find((tab) => tab.id === activeTab)!}
                  onChange={(tab) => {
                    if (tab?.id === "api" || tab?.id === "url") {
                      setActiveTab(tab.id);
                    }
                  }}
                  tabs={[...integrationTabs]}
                />
                <Text as="p" font="label2" color="fgMuted" className="mt-2">
                  {activeTab === "api"
                    ? "Connect your wallet to sell crypto for fiat"
                    : "Generate a link to share with others"}
                </Text>
              </div>

              {/* Embedded Wallet Required Message */}
              {activeTab === "api" && !isConnected && (
                <div className="mb-6">
                  <Banner
                    startIcon="info"
                    startIconActive
                    styleVariant="inline"
                    title="Offramp requires CDP Embedded Wallet"
                    variant="informational"
                  >
                    <Text as="p" font="label2">
                      Please sign in using the Sign in button in the header to continue.
                    </Text>
                  </Banner>
                </div>
              )}

              <VStack gap={3}>
                <CdsSelectField
                  label="Country"
                  value={selectedCountry}
                  onChange={(value) => {
                    setSelectedCountry(value);
                    setSelectedSubdivision("");
                  }}
                  options={countries.map((country) => ({
                    value: country.code,
                    label: country.name,
                  }))}
                />
                {selectedCountry === "US" && (
                  <CdsSelectField
                    label="State"
                    value={selectedSubdivision}
                    onChange={setSelectedSubdivision}
                    options={US_STATES.map((state) => ({
                      value: state.code,
                      label: state.name,
                    }))}
                  />
                )}
                <CdsSelectField
                  label="Asset"
                  value={selectedAsset}
                  onChange={handleAssetChange}
                  options={availableAssets.map((asset) => ({
                    value: asset.code,
                    label: `${asset.name} (${asset.code})`,
                  }))}
                />
                <CdsSelectField
                  label="Network"
                  value={selectedNetwork}
                  onChange={setSelectedNetwork}
                  helperText={
                    assetNetworkMap[selectedAsset]
                      ? `${selectedAsset} is available on ${
                          assetNetworkMap[selectedAsset].length
                        } network${
                          assetNetworkMap[selectedAsset].length > 1 ? "s" : ""
                        }`
                      : undefined
                  }
                  options={networks
                    .filter(
                      (network) =>
                        !assetNetworkMap[selectedAsset] ||
                        assetNetworkMap[selectedAsset].includes(network.id)
                    )
                    .map((network) => ({
                      value: network.id,
                      label: network.name,
                    }))}
                />
                <VStack gap={1}>
                  <HStack gap={1}>
                    {["10", "25", "50"].map((preset) => (
                      <Button
                        key={preset}
                        variant={amount === preset ? "primary" : "secondary"}
                        className="cds-preset-amount-button"
                        onClick={() => setAmount(preset)}
                      >
                        ${preset}
                      </Button>
                    ))}
                  </HStack>
                  <CdsTextField
                    label="Amount"
                    value={amount}
                    onChange={setAmount}
                    start="$"
                  />
                </VStack>
                <CdsSelectField
                  label="Cashout Method"
                  value={selectedCashoutMethod}
                  onChange={setSelectedCashoutMethod}
                  options={cashoutMethods.map((method) => ({
                    value: method.id,
                    label: method.name,
                  }))}
                />
              </VStack>

              {/* Advanced Options */}
              <div className="mb-8">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  aria-label="Toggle advanced options"
                >
                  {showAdvanced ? "Hide" : "Show"} Advanced Options
                  <svg
                    className={`ml-2 w-4 h-4 transform ${
                      showAdvanced ? "rotate-180" : ""
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

                {showAdvanced && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    {/* Secure Initialization Info */}
                    <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-purple-900">
                            Secure Session Enabled
                          </p>
                          <p className="text-sm text-purple-800 mt-1">
                            Using secure session tokens.{" "}
                            <a 
                              href="https://docs.cdp.coinbase.com/onramp/docs/api-offramp-initializing#getting-a-session-token"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-purple-700"
                            >
                              Learn more
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Button
                block
                variant="primary"
                className="cds-primary-cta"
                onClick={activeTab === "api" ? handleOfframp : handleGenerateUrl}
                disabled={!isConnected || isGeneratingToken}
                loading={isGeneratingToken}
              >
                {isGeneratingToken 
                  ? "Generating Session Token..." 
                  : activeTab === "api" 
                    ? "Sell Crypto Now" 
                    : "Generate Offramp URL"
                }
              </Button>

              {/* Error Message */}
              {errorMessage && (
                <Box className="mt-4">
                  <Banner
                    startIcon="error"
                    startIconActive
                    styleVariant="inline"
                    title="Could not create offramp"
                    variant="error"
                  >
                    <Text as="p" font="label2">
                      {errorMessage}
                    </Text>
                  </Banner>
                </Box>
              )}
              </ContentCardBody>
            </ContentCard>

            {/* Preview Box */}
            <ContentCard className="cds-card p-8">
              <ContentCardBody title={<Text as="h3" font="title3">Preview</Text>}>

              {activeTab === "api" ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <button
                    onClick={handleOfframp}
                    disabled={!isConnected || isLoading}
                    className={`px-8 py-3 rounded-lg font-medium mb-4 ${
                      !isConnected || isLoading
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    Sell with Coinbase
                  </button>
                  <p className="text-gray-500 text-sm">
                    A simple button that opens the Coinbase Offramp flow
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">You'll receive</p>
                    <p className="text-2xl font-bold text-gray-800">
                      ${parseFloat(amount || "0").toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Selling</p>
                    <p className="font-medium text-gray-800">
                      {getSelectedAssetName()} ({selectedAsset})
                    </p>
                    <p className="text-sm text-gray-500">
                      on {getSelectedNetworkName()}
                    </p>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Cashout Method</p>
                    <p className="font-medium text-gray-800">
                      {cashoutMethods.find(
                        (m) => m.id === selectedCashoutMethod
                      )?.name || selectedCashoutMethod}
                    </p>
                  </div>

                  {isConnected && (
                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">
                        Connected Wallet
                      </p>
                      <p className="font-medium text-gray-800">
                        {address
                          ? `${address.substring(0, 6)}...${address.substring(
                              address.length - 4
                            )}`
                          : "Not connected"}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleOfframp}
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg font-medium mt-6 ${
                      isLoading
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {isLoading ? "Generating..." : "Generate Link"}
                  </button>
                </div>
              )}
              </ContentCardBody>
            </ContentCard>
          </div>
        </div>
      </div>

      {/* URL Modal */}
      {showUrlModal && (
        <GeneratedLinkModal
          title="Generated Offramp URL"
          url={generatedUrl}
          onClose={() => setShowUrlModal(false)}
          onCopy={handleCopyUrl}
          onOpen={handleOpenUrl}
        />
      )}

      {/* Notification */}
      {showNotification && (
        <OfframpNotification
          onClose={() => setShowNotification(false)}
          status={status || "default"}
        />
      )}
    </div>
  );
}
