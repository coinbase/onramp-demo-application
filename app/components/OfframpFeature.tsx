"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { generateOfframpURL } from "../utils/rampUtils";
import {
  fetchSellConfig,
  fetchSellOptions,
  Country,
  CryptoAsset,
} from "../utils/offrampApi";
import { useSearchParams } from "next/navigation";
import OfframpNotification from "./OfframpNotification";
import { WalletDefault } from "@coinbase/onchainkit/wallet";

// Define types for the modal component
interface SimpleModalProps {
  title: string;
  content: React.ReactNode;
  onClose: () => void;
  actions: React.ReactNode;
}

// Simple modal component
const SimpleModal: React.FC<SimpleModalProps> = ({
  title,
  content,
  onClose,
  actions,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="mb-4">{content}</div>
      <div className="flex gap-2">{actions}</div>
    </div>
  </div>
);

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
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
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
  const [useSecureInit, setUseSecureInit] = useState(true);
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
    if (status) {
      setShowNotification(true);
    }
  }, [status]);

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

  // Generate session token
  const generateSessionToken = async () => {
    if (!address) {
      alert("Please connect your wallet first");
      return null;
    }

    try {
      setIsGeneratingToken(true);
      
      // Prepare addresses array based on selected network
      const addresses = [{
        address: address,
        blockchains: [selectedNetwork]
      }];
      
      // Make request to our API endpoint
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addresses,
          assets: [selectedAsset],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate session token');
      }

      const data = await response.json();
      
      // Check if this is a mock token
      if (data.mock) {
        console.warn('Using mock session token. In production, configure CDP API credentials.');
        // For demo purposes, we'll skip using the session token
        return null;
      }
      
      return data.token;
    } catch (error) {
      console.error('Error generating session token:', error);
      alert(`Session token generation failed. The transaction will proceed with standard authentication.\n\nFor production use, ensure your CDP API credentials are properly configured.`);
      return null;
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Handle offramp
  const handleOfframp = async () => {
    // Clear any previous error
    setErrorMessage(null);

    if (!isConnected) {
      setErrorMessage("Please connect your wallet first");
      return;
    }

    if (!selectedCashoutMethod) {
      setErrorMessage("Please select a cashout method");
      return;
    }

    let sessionToken: string | undefined;
    
    // Generate session token if secure init is enabled
    if (useSecureInit) {
      const token = await generateSessionToken();
      if (!token) return; // Exit if token generation failed
      sessionToken = token;
    }

    const url = generateOfframpURL({
      asset: selectedAsset,
      amount,
      network: selectedNetwork,
      cashoutMethod: selectedCashoutMethod,
      address: address || "0x0000000000000000000000000000000000000000",
      redirectUrl: window.location.origin + "/offramp",
      sessionToken, // Include session token if generated
    });

    window.open(url, "_blank");
  };

  // Generate one-time URL
  const handleGenerateUrl = async () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!selectedCashoutMethod) {
      alert("Please select a cashout method");
      return;
    }

    let sessionToken: string | undefined;
    
    // Generate session token if secure init is enabled
    if (useSecureInit) {
      const token = await generateSessionToken();
      if (!token) return; // Exit if token generation failed
      sessionToken = token;
    }

    const url = generateOfframpURL({
      asset: selectedAsset,
      amount,
      network: selectedNetwork,
      cashoutMethod: selectedCashoutMethod,
      address: address || "0x0000000000000000000000000000000000000000",
      redirectUrl: window.location.origin + "/offramp",
      sessionToken, // Include session token if generated
    });

    setGeneratedUrl(url);
    setShowUrlModal(true);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configuration Box */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
              <h3 className="text-xl font-bold mb-6 text-gray-800">
                Configure Your Offramp
              </h3>

              {/* Tab Selection */}
              <div className="mb-6">
                <div className="flex space-x-2 mb-2">
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeTab === "api"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                    onClick={() => setActiveTab("api")}
                  >
                    Offramp API
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeTab === "url"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                    onClick={() => setActiveTab("url")}
                  >
                    One-time Payment Link
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  {activeTab === "api"
                    ? "Connect your wallet to sell crypto for fiat"
                    : "Generate a link to share with others"}
                </p>
              </div>

              {/* Connect Wallet Button */}
              {activeTab === "api" && !isConnected && (
                <div className="mb-6">
                  <button
                    onClick={() => {
                      if (connectors.length > 0) {
                        connect({ connector: connectors[0] });
                      }
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
                  >
                    Connect Wallet
                  </button>
                </div>
              )}

              {/* Country Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">
                  Country
                </label>
                <div className="relative">
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      // Reset subdivision when country changes
                      setSelectedSubdivision("");
                    }}
                    className="block w-full bg-white border border-gray-300 rounded-lg py-3 px-4 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* State Selection - Only show for US */}
              {selectedCountry === "US" && (
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2 font-medium">
                    State
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSubdivision}
                      onChange={(e) => setSelectedSubdivision(e.target.value)}
                      className="block w-full bg-white border border-gray-300 rounded-lg py-3 px-4 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                    >
                      {US_STATES.map((state) => (
                        <option key={state.code} value={state.code}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Asset Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">
                  Asset
                </label>
                <div className="relative">
                  <select
                    value={selectedAsset}
                    onChange={(e) => handleAssetChange(e.target.value)}
                    className="block w-full bg-white border border-gray-300 rounded-lg py-3 px-4 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  >
                    {availableAssets.map((asset) => (
                      <option key={asset.code} value={asset.code}>
                        {asset.name} ({asset.code})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Network Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">
                  Network
                </label>
                <div className="relative">
                  <select
                    value={selectedNetwork}
                    onChange={(e) => setSelectedNetwork(e.target.value)}
                    className="block w-full bg-white border border-gray-300 rounded-lg py-3 px-4 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  >
                    {/* Filter networks based on selected asset */}
                    {networks
                      .filter(
                        (network) =>
                          !assetNetworkMap[selectedAsset] ||
                          assetNetworkMap[selectedAsset].includes(network.id)
                      )
                      .map((network) => (
                        <option key={network.id} value={network.id}>
                          {network.name}
                        </option>
                      ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                {assetNetworkMap[selectedAsset] && (
                  <p className="text-sm text-gray-500 mt-2">
                    {selectedAsset} is available on{" "}
                    {assetNetworkMap[selectedAsset].length} network
                    {assetNetworkMap[selectedAsset].length > 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">
                  Amount
                </label>
                <div className="flex space-x-2 mb-2">
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-gray-800"
                    onClick={() => setAmount("10")}
                  >
                    $10
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-gray-800"
                    onClick={() => setAmount("25")}
                  >
                    $25
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-gray-800"
                    onClick={() => setAmount("50")}
                  >
                    $50
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    $
                  </span>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full bg-white border border-gray-300 rounded-lg py-3 pl-8 pr-4 text-gray-800"
                  />
                </div>
              </div>

              {/* Cashout Method */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">
                  Cashout Method
                </label>
                <div className="relative">
                  <select
                    value={selectedCashoutMethod}
                    onChange={(e) => setSelectedCashoutMethod(e.target.value)}
                    className="block w-full bg-white border border-gray-300 rounded-lg py-3 px-4 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  >
                    {cashoutMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

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
              <button
                onClick={activeTab === "api" ? handleOfframp : handleGenerateUrl}
                disabled={!isConnected || isGeneratingToken}
                className={`w-full font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg ${
                  !isConnected || isGeneratingToken
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isGeneratingToken 
                  ? "Generating Session Token..." 
                  : activeTab === "api" 
                    ? "Sell Crypto Now" 
                    : "Generate Offramp URL"
                }
              </button>

              {/* Error Message */}
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Preview Box */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
              <h3 className="text-xl font-bold mb-6 text-gray-800">Preview</h3>

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
            </div>
          </div>
        </div>
      </div>

      {/* URL Modal */}
      {showUrlModal && (
        <SimpleModal
          title="Generated Offramp URL"
          content={
            <div>
              <p className="text-gray-700 mb-2">
                Use this URL to redirect users to Coinbase:
              </p>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 overflow-hidden">
                <div className="text-xs text-gray-800 break-all max-h-32 overflow-y-auto">
                  {generatedUrl}
                </div>
              </div>
            </div>
          }
          onClose={() => setShowUrlModal(false)}
          actions={
            <>
              <button
                onClick={handleCopyUrl}
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 py-2 px-4 rounded-lg font-medium"
              >
                Copy URL
              </button>
              <button
                onClick={handleOpenUrl}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium"
              >
                Open URL
              </button>
            </>
          }
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
