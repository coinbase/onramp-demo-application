/**
 * API utilities for Coinbase Onramp
 */

// Types for Buy Config API response (RAW from CDP API)
export interface ApiPaymentMethodType {
  id: string; // Payment method enum: CARD, ACH_BANK_ACCOUNT, APPLE_PAY, etc.
}

export interface ApiSupportedCountry {
  id: string; // ISO 3166-1 two-letter country code
  payment_methods: ApiPaymentMethodType[];
  subdivisions?: string[]; // Only returned for US (state codes)
}

export interface ApiBuyConfigResponse {
  countries: ApiSupportedCountry[];
}

// Types for Buy Options API response (RAW from CDP API)
export interface ApiPaymentMethodLimit {
  id: string; // Payment method type: CARD, ACH_BANK_ACCOUNT, etc.
  min: string;
  max: string;
}

export interface ApiPaymentCurrency {
  id: string; // e.g., "USD"
  limits: ApiPaymentMethodLimit[];
}

export interface ApiPublicNetwork {
  name: string; // e.g., "ethereum"
  display_name: string; // e.g., "Ethereum"
  chain_id?: number;
  contract_address?: string;
}

export interface ApiPurchaseCurrency {
  id: string; // Unique identifier
  symbol: string; // e.g., "USDC"
  name: string; // e.g., "USD Coin"
  networks: ApiPublicNetwork[];
  icon_url?: string;
}

export interface ApiBuyOptionsResponse {
  payment_currencies: ApiPaymentCurrency[];
  purchase_currencies: ApiPurchaseCurrency[];
}

// UI-friendly types (transformed from API response)
export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
}

export interface Country {
  id: string;
  name: string;
  paymentMethods: PaymentMethod[];
  subdivisions?: string[];
}

export interface BuyConfigResponse {
  countries: Country[];
}

export interface CurrencyLimit {
  id: string;
  min: string;
  max: string;
}

export interface PaymentCurrency {
  id: string;
  name: string;
  limits: CurrencyLimit[];
}

export interface FiatCurrency {
  id: string;
  name: string;
  symbol?: string;
}

export interface Network {
  id: string; // Transformed from API's "name"
  name: string; // Transformed from API's "display_name"
  chainId?: number;
  contractAddress?: string;
}

export interface PurchaseCurrency {
  id: string;
  symbol: string;
  name: string;
  networks: Network[];
  iconUrl?: string;
}

export interface BuyOptionsResponse {
  paymentCurrencies: PaymentCurrency[];
  purchaseCurrencies: PurchaseCurrency[];
}

// Country data with names
export const countryNames: Record<string, string> = {
  // North America
  US: "United States",
  CA: "Canada",
  MX: "Mexico",

  // Europe
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
  CH: "Switzerland",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  IE: "Ireland",
  AT: "Austria",
  BE: "Belgium",
  PT: "Portugal",
  GR: "Greece",
  PL: "Poland",
  CZ: "Czech Republic",
  SK: "Slovakia",
  HU: "Hungary",
  RO: "Romania",
  BG: "Bulgaria",
  HR: "Croatia",
  SI: "Slovenia",
  LT: "Lithuania",
  LV: "Latvia",
  EE: "Estonia",
  CY: "Cyprus",
  MT: "Malta",
  LU: "Luxembourg",
  IS: "Iceland",
  LI: "Liechtenstein",
  MC: "Monaco",

  // Asia Pacific
  AU: "Australia",
  NZ: "New Zealand",
  JP: "Japan",
  SG: "Singapore",
  HK: "Hong Kong",
  KR: "South Korea",
  TW: "Taiwan",
  TH: "Thailand",
  MY: "Malaysia",
  PH: "Philippines",
  ID: "Indonesia",
  VN: "Vietnam",
  IN: "India",
  CN: "China",

  // Middle East & Africa
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  QA: "Qatar",
  BH: "Bahrain",
  KW: "Kuwait",
  OM: "Oman",
  IL: "Israel",
  ZA: "South Africa",
  EG: "Egypt",
  NG: "Nigeria",
  KE: "Kenya",

  // Latin America
  BR: "Brazil",
  AR: "Argentina",
  CL: "Chile",
  CO: "Colombia",
  PE: "Peru",
  UY: "Uruguay",
  CR: "Costa Rica",
  PA: "Panama",

  // Other regions
  TR: "Turkey",
  RU: "Russia",
  UA: "Ukraine",
  BY: "Belarus",
  KZ: "Kazakhstan",
};

// Helper function to map payment method IDs to friendly names
export const paymentMethodNames: Record<string, { name: string; description: string }> = {
  CARD: { name: "Debit/Credit Card", description: "Available in 90+ countries" },
  ACH_BANK_ACCOUNT: { name: "Bank Transfer (ACH)", description: "US only, 1-3 business days" },
  APPLE_PAY: { name: "Apple Pay", description: "Available on iOS devices" },
  PAYPAL: { name: "PayPal", description: "Available in select countries" },
  RTP: { name: "Real-Time Payments (RTP)", description: "US only, instant" },
  FIAT_WALLET: { name: "Coinbase Fiat Wallet", description: "Instant transfer to your Coinbase account" },
  CRYPTO_ACCOUNT: { name: "Crypto Account", description: "Coinbase crypto account" },
  GUEST_CHECKOUT_CARD: { name: "Guest Checkout Card", description: "Card payment without account" },
  GUEST_CHECKOUT_APPLE_PAY: { name: "Guest Checkout Apple Pay", description: "Apple Pay without account" },
  UNSPECIFIED: { name: "Unspecified", description: "Payment method not specified" },
};

// Helper mapping for currency names
const currencyNames: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  JPY: "Japanese Yen",
  CHF: "Swiss Franc",
  NZD: "New Zealand Dollar",
  SGD: "Singapore Dollar",
  HKD: "Hong Kong Dollar",
  MXN: "Mexican Peso",
  BRL: "Brazilian Real",
};

// Helper function to transform CDP Buy Config API response to UI-friendly format
export function transformBuyConfigResponse(apiResponse: ApiBuyConfigResponse): BuyConfigResponse {
  return {
    countries: apiResponse.countries.map((country) => ({
      id: country.id,
      name: countryNames[country.id] || country.id,
      paymentMethods: country.payment_methods.map((pm) => ({
        id: pm.id,
        name: paymentMethodNames[pm.id]?.name || pm.id,
        description: paymentMethodNames[pm.id]?.description,
      })),
      subdivisions: country.subdivisions,
    })),
  };
}

// Helper function to transform CDP Buy Options API response to UI-friendly format
export function transformBuyOptionsResponse(apiResponse: ApiBuyOptionsResponse): BuyOptionsResponse {
  return {
    // Transform payment currencies (fiat)
    paymentCurrencies: apiResponse.payment_currencies.map((currency) => ({
      id: currency.id,
      name: currencyNames[currency.id] || currency.id,
      limits: currency.limits.map((limit) => ({
        id: limit.id,
        min: limit.min,
        max: limit.max,
      })),
    })),
    // Transform purchase currencies (crypto assets)
    purchaseCurrencies: apiResponse.purchase_currencies.map((asset) => ({
      id: asset.id,
      symbol: asset.symbol, // Use symbol (e.g., "USDC")
      name: asset.name,
      networks: asset.networks.map((network) => ({
        id: network.name, // Use name (e.g., "ethereum") as the id
        name: network.display_name, // Use display_name (e.g., "Ethereum") for display
        chainId: network.chain_id,
        contractAddress: network.contract_address,
      })),
      iconUrl: asset.icon_url,
    })),
  };
}

// Cache for API responses
let buyConfigCache: BuyConfigResponse | null = null;
let buyOptionsCache: Record<string, BuyOptionsResponse> = {};
const CACHE_EXPIRY = 1000 * 60 * 15; // 15 minutes
let lastConfigFetch = 0;
let lastOptionsFetch: Record<string, number> = {};

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
  BTC: ["bitcoin", "bitcoin-lightning"],
  SOL: ["solana"],
  MATIC: ["polygon", "ethereum"],
  AVAX: ["avalanche-c-chain"],
  ADA: ["cardano"],
  DOT: ["polkadot"],
  ATOM: ["cosmos"],
  XRP: ["xrp"],
  ALGO: ["algorand"],
  FIL: ["filecoin"],
  NEAR: ["near"],
  XLM: ["stellar"],
  TRX: ["tron"],
  // Add more mappings as needed
};

/**
 * Fetches the list of supported countries and payment methods from CDP API
 * API Docs: https://docs.cdp.coinbase.com/onramp/v1/buy/config
 * Returns UI-friendly format with country names and payment method descriptions
 */
export async function fetchBuyConfig(): Promise<BuyConfigResponse> {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    if (buyConfigCache && now - lastConfigFetch < CACHE_EXPIRY) {
      return buyConfigCache;
    }

    // Call the real CDP Buy Config API
    const response = await fetch('/api/buy-config');

    if (!response.ok) {
      console.warn('Failed to fetch buy config from API, using fallback data');
      throw new Error('API call failed');
    }

    const apiData: ApiBuyConfigResponse = await response.json();
    // Transform CDP API format to UI-friendly format
    const transformedData = transformBuyConfigResponse(apiData);

    console.log('✅ Buy config loaded from CDP API:', {
      countryCount: transformedData.countries.length,
      countries: transformedData.countries.map(c => c.id).join(', ')
    });

    // Update cache
    buyConfigCache = transformedData;
    lastConfigFetch = now;

    return transformedData;
  } catch (error) {
    console.error("⚠️ Error fetching buy config from CDP API, using fallback data:", error);
    console.warn("⚠️ Using mock data for countries and payment methods. Real API data may differ.");

    // If API call fails and we have a cache, return the cache even if expired
    if (buyConfigCache) {
      console.warn("Returning cached buy config due to API error");
      return buyConfigCache;
    }

    // Fallback to mock data if API fails
    return {
      countries: [
        {
          id: "US",
          name: "United States",
          paymentMethods: [
            { id: "CARD", name: "Debit/Credit Card", description: "Available in 90+ countries" },
            { id: "ACH_BANK_ACCOUNT", name: "Bank Transfer (ACH)", description: "US only, 1-3 business days" },
            { id: "APPLE_PAY", name: "Apple Pay", description: "Available on iOS devices" },
            { id: "PAYPAL", name: "PayPal", description: "Available in select countries" }
          ],
          subdivisions: [
            "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
            "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
            "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
            "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
            "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
          ]
        },
        {
          id: "GB",
          name: "United Kingdom",
          paymentMethods: [
            { id: "CARD", name: "Debit/Credit Card", description: "Available in 90+ countries" },
            { id: "PAYPAL", name: "PayPal", description: "Available in select countries" }
          ]
        },
        {
          id: "CA",
          name: "Canada",
          paymentMethods: [
            { id: "CARD", name: "Debit/Credit Card", description: "Available in 90+ countries" }
          ]
        },
        {
          id: "DE",
          name: "Germany",
          paymentMethods: [
            { id: "CARD", name: "Debit/Credit Card", description: "Available in 90+ countries" }
          ]
        },
        {
          id: "FR",
          name: "France",
          paymentMethods: [
            { id: "CARD", name: "Debit/Credit Card", description: "Available in 90+ countries" }
          ]
        },
        {
          id: "AU",
          name: "Australia",
          paymentMethods: [
            { id: "CARD", name: "Debit/Credit Card", description: "Available in 90+ countries" }
          ]
        },
      ]
    };
  }
}

/**
 * Fetches the available options for buying crypto from CDP API
 * API Docs: https://docs.cdp.coinbase.com/onramp/v1/buy/options
 */
export async function fetchBuyOptions(country: string, subdivision?: string): Promise<BuyOptionsResponse> {
  try {
    // Create a cache key based on country and subdivision
    const cacheKey = `${country}${subdivision ? `-${subdivision}` : ''}`;

    // Check if we have a valid cache
    const now = Date.now();
    if (buyOptionsCache[cacheKey] && now - (lastOptionsFetch[cacheKey] || 0) < CACHE_EXPIRY) {
      return buyOptionsCache[cacheKey];
    }

    // Call the real CDP Buy Options API
    const params = new URLSearchParams({ country });
    if (subdivision) {
      params.append('subdivision', subdivision);
    }

    console.log('📡 Calling Buy Options API:', { country, subdivision });
    const response = await fetch(`/api/buy-options?${params.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Buy Options API failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`API call failed: ${response.status} ${errorText}`);
    }

    const apiData: ApiBuyOptionsResponse = await response.json();
    console.log('📦 Raw API response:', apiData);

    // Transform CDP API response to UI-friendly format
    const transformedData = transformBuyOptionsResponse(apiData);

    console.log('✅ Buy options loaded from CDP API:', {
      paymentCurrenciesCount: transformedData.paymentCurrencies?.length || 0,
      purchaseCurrenciesCount: transformedData.purchaseCurrencies?.length || 0,
      paymentCurrencies: transformedData.paymentCurrencies.map(c => c.id).join(', '),
      purchaseCurrencies: transformedData.purchaseCurrencies.map(c => c.symbol).join(', '),
    });

    // Update cache
    buyOptionsCache[cacheKey] = transformedData;
    lastOptionsFetch[cacheKey] = now;

    return transformedData;
  } catch (error) {
    console.error("⚠️ Error fetching buy options from CDP API, using fallback data:", error);
    console.warn("⚠️ Using mock data for assets and payment currencies. Real API data may differ.");

    // If API call fails and we have a cache for this country/subdivision, return the cache even if expired
    const cacheKey = `${country}${subdivision ? `-${subdivision}` : ''}`;
    if (buyOptionsCache[cacheKey]) {
      console.warn("Returning cached buy options due to API error");
      return buyOptionsCache[cacheKey];
    }

    // Fallback to mock data if API fails
    return {
      paymentCurrencies: [
        {
          id: "USD",
          name: "US Dollar",
          limits: [
            {
              id: "CARD",
              min: "10.00",
              max: "1000.00"
            },
            {
              id: "ACH_BANK_ACCOUNT",
              min: "10.00",
              max: "25000.00"
            },
            {
              id: "APPLE_PAY",
              min: "10.00",
              max: "1000.00"
            },
            {
              id: "PAYPAL",
              min: "10.00",
              max: "1000.00"
            }
          ]
        },
        {
          id: "EUR",
          name: "Euro",
          limits: [
            {
              id: "CARD",
              min: "10.00",
              max: "1000.00"
            },
            {
              id: "SEPA",
              min: "10.00",
              max: "25000.00"
            }
          ]
        },
        {
          id: "GBP",
          name: "British Pound",
          limits: [
            {
              id: "CARD",
              min: "10.00",
              max: "1000.00"
            },
            {
              id: "PAYPAL",
              min: "10.00",
              max: "1000.00"
            }
          ]
        }
      ],
      purchaseCurrencies: [
        {
          iconUrl: "",
          id: "ETH",
          name: "Ethereum",
          symbol: "ETH",
          networks: [
            {
              id: "ethereum",
              name: "Ethereum",
              chainId: 1,
              contractAddress: ""
            },
            {
              id: "optimism",
              name: "Optimism",
              chainId: 10,
              contractAddress: ""
            },
            {
              id: "arbitrum",
              name: "Arbitrum",
              chainId: 42161,
              contractAddress: ""
            },
            {
              id: "base",
              name: "Base",
              chainId: 8453,
              contractAddress: ""
            }
          ]
        },
        {
          iconUrl: "",
          id: "USDC",
          name: "USD Coin",
          symbol: "USDC",
          networks: [
            {
              id: "ethereum",
              name: "Ethereum",
              chainId: 1,
              contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
            },
            {
              id: "optimism",
              name: "Optimism",
              chainId: 10,
              contractAddress: "0x7f5c764cbc14f9669b88837ca1490cca17c31607"
            },
            {
              id: "arbitrum",
              name: "Arbitrum",
              chainId: 42161,
              contractAddress: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"
            },
            {
              id: "base",
              name: "Base",
              chainId: 8453,
              contractAddress: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
            },
            {
              id: "polygon",
              name: "Polygon",
              chainId: 137,
              contractAddress: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
            },
            {
              id: "solana",
              name: "Solana",
              chainId: 0,
              contractAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
            }
          ]
        },
        {
          iconUrl: "",
          id: "BTC",
          name: "Bitcoin",
          symbol: "BTC",
          networks: [
            {
              id: "bitcoin",
              name: "Bitcoin",
              chainId: 0,
              contractAddress: ""
            }
          ]
        },
        {
          iconUrl: "",
          id: "SOL",
          name: "Solana",
          symbol: "SOL",
          networks: [
            {
              id: "solana",
              name: "Solana",
              chainId: 0,
              contractAddress: ""
            }
          ]
        },
        {
          iconUrl: "",
          id: "MATIC",
          name: "Polygon",
          symbol: "MATIC",
          networks: [
            {
              id: "ethereum",
              name: "Ethereum",
              chainId: 1,
              contractAddress: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0"
            },
            {
              id: "polygon",
              name: "Polygon",
              chainId: 137,
              contractAddress: ""
            }
          ]
        }
      ]
    };
  }
}
