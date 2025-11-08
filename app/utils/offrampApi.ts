/**
 * API utilities for Coinbase Offramp
 */

// Types for Sell Config API response
// Based on CDP API: https://docs.cdp.coinbase.com/api-reference/rest-api/onramp-offramp/get-sell-config
export interface PaymentMethodType {
  id: string; // Payment method enum: ACH_BANK_ACCOUNT, PAYPAL, FIAT_WALLET, RTP, APPLE_PAY, etc.
}

export interface SupportedCountry {
  id: string; // ISO 3166-1 two-letter country code
  payment_methods: PaymentMethodType[];
  subdivisions?: string[]; // Only returned for US (state codes)
}

export interface SellConfigResponse {
  countries: SupportedCountry[];
}

// Legacy types for backward compatibility with UI
export interface CashoutMethod {
  id: string;
  name: string;
  description?: string;
}

export interface Country {
  code: string;
  name: string;
  cashout_methods: CashoutMethod[];
  supported_states?: string[];
}

// Types for Sell Options API response (RAW from CDP API)
export interface ApiPaymentMethodLimit {
  id: string; // Payment method type: CARD, ACH_BANK_ACCOUNT, etc.
  min: string;
  max: string;
}

export interface ApiFiatCurrency {
  id: string; // e.g., "USD"
  limits: ApiPaymentMethodLimit[];
}

export interface ApiNetwork {
  name: string; // e.g., "ethereum"
  display_name: string; // e.g., "Ethereum"
  chain_id?: number;
  contract_address?: string;
}

export interface ApiCryptoAsset {
  id: string; // Unique identifier
  symbol: string; // e.g., "USDC"
  name: string; // e.g., "USD Coin"
  networks: ApiNetwork[];
  icon_url?: string;
}

export interface ApiSellOptionsResponse {
  cashout_currencies: ApiFiatCurrency[];
  sell_currencies: ApiCryptoAsset[];
}

// UI-friendly types (transformed from API response)
export interface CurrencyLimit {
  min: string;
  max: string;
}

export interface CashoutMethodOption {
  id: string;
  name: string;
  limits: Record<string, CurrencyLimit>;
}

export interface FiatCurrency {
  code: string;
  name: string;
  cashout_methods: CashoutMethodOption[];
}

export interface CryptoAsset {
  code: string;
  name: string;
  networks: {
    id: string;
    name: string;
  }[];
}

export interface SellOptionsResponse {
  cashout_currencies: FiatCurrency[];
  sell_currencies: CryptoAsset[];
}

// Helper function to map payment method IDs to friendly names
export const paymentMethodNames: Record<string, { name: string; description: string }> = {
  ACH_BANK_ACCOUNT: { name: "Bank Transfer (ACH)", description: "US only, 1-3 business days" },
  PAYPAL: { name: "PayPal", description: "Available in select countries" },
  FIAT_WALLET: { name: "Coinbase Fiat Wallet", description: "Instant transfer to your Coinbase account" },
  RTP: { name: "Real-Time Payments (RTP)", description: "US only, instant" },
  APPLE_PAY: { name: "Apple Pay", description: "Available in select countries" },
  CARD: { name: "Debit/Credit Card", description: "Available in select countries" },
  CRYPTO_ACCOUNT: { name: "Crypto Account", description: "Coinbase crypto account" },
  GUEST_CHECKOUT_CARD: { name: "Guest Checkout Card", description: "Card payment without account" },
  GUEST_CHECKOUT_APPLE_PAY: { name: "Guest Checkout Apple Pay", description: "Apple Pay without account" },
  UNSPECIFIED: { name: "Unspecified", description: "Payment method not specified" },
};

// Helper function to transform CDP Sell Config API response to UI-friendly format
export function transformSellConfigResponse(apiResponse: SellConfigResponse): { countries: Country[] } {
  return {
    countries: apiResponse.countries.map((country) => ({
      code: country.id,
      name: countryNames[country.id] || country.id,
      cashout_methods: country.payment_methods.map((pm) => ({
        id: pm.id,
        name: paymentMethodNames[pm.id]?.name || pm.id,
        description: paymentMethodNames[pm.id]?.description,
      })),
      supported_states: country.subdivisions,
    })),
  };
}

// Helper function to transform CDP Sell Options API response to UI-friendly format
export function transformSellOptionsResponse(apiResponse: ApiSellOptionsResponse): SellOptionsResponse {
  return {
    // Transform fiat currencies
    cashout_currencies: apiResponse.cashout_currencies.map((currency) => ({
      code: currency.id,
      name: currencyNames[currency.id] || currency.id,
      cashout_methods: currency.limits.map((limit) => ({
        id: limit.id,
        name: paymentMethodNames[limit.id]?.name || limit.id,
        limits: {
          [currency.id]: {
            min: limit.min,
            max: limit.max,
          },
        },
      })),
    })),
    // Transform crypto assets
    sell_currencies: apiResponse.sell_currencies.map((asset) => ({
      code: asset.symbol, // Use symbol (e.g., "USDC") as the code
      name: asset.name,
      networks: asset.networks.map((network) => ({
        id: network.name, // Use name (e.g., "ethereum") as the id
        name: network.display_name, // Use display_name (e.g., "Ethereum") for display
      })),
    })),
  };
}

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

// Country data with names
export const countryNames: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  AU: "Australia",
  JP: "Japan",
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
  NZ: "New Zealand",
  SG: "Singapore",
  HK: "Hong Kong",
  AE: "United Arab Emirates",
  BR: "Brazil",
  MX: "Mexico",
};

/**
 * Fetches the list of supported countries and cashout methods from CDP API
 * API Docs: https://docs.cdp.coinbase.com/onramp/v1/sell/config
 * Returns UI-friendly format with country names and payment method descriptions
 */
export async function fetchSellConfig(): Promise<{ countries: Country[] }> {
  try {
    // Call the real CDP Sell Config API
    const response = await fetch('/api/sell-config');
    
    if (!response.ok) {
      console.warn('Failed to fetch sell config from API, using fallback data');
      throw new Error('API call failed');
    }
    
    const apiData: SellConfigResponse = await response.json();
    // Transform CDP API format to UI-friendly format
    const transformedData = transformSellConfigResponse(apiData);
    
    console.log('✅ Sell config loaded from CDP API:', {
      countryCount: transformedData.countries.length,
      countries: transformedData.countries.map(c => c.code).join(', ')
    });
    
    return transformedData;
  } catch (error) {
    console.error("⚠️ Error fetching sell config from CDP API, using fallback data:", error);
    console.warn("⚠️ Using mock data for countries and payment methods. Real API data may differ.");
    // Fallback to mock data if API fails
    return {
      countries: [
        {
          code: "US",
          name: "United States",
          cashout_methods: [
            { id: "ACH_BANK_ACCOUNT", name: "Bank Transfer (ACH)", description: "US only, 1-3 business days" },
            { id: "PAYPAL", name: "PayPal", description: "Available in select countries" },
            { id: "FIAT_WALLET", name: "Coinbase Fiat Wallet", description: "Instant transfer to your Coinbase account" },
            { id: "RTP", name: "Real-Time Payments (RTP)", description: "US only, instant" },
          ],
          supported_states: [
            "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
            "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
            "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
            "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
            "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
            "DC"
          ],
        },
        {
          code: "GB",
          name: "United Kingdom",
          cashout_methods: [
            { id: "SEPA_BANK_ACCOUNT", name: "SEPA Bank Transfer", description: "1-3 business days" },
            { id: "PAYPAL", name: "PayPal", description: "Available in select countries" },
            { id: "FIAT_WALLET", name: "Coinbase Fiat Wallet", description: "Instant transfer to your Coinbase account" },
          ],
        },
        {
          code: "CA",
          name: "Canada",
          cashout_methods: [
            { id: "EFT_BANK_ACCOUNT", name: "EFT Bank Transfer", description: "1-3 business days" },
            { id: "PAYPAL", name: "PayPal", description: "Available in select countries" },
            { id: "FIAT_WALLET", name: "Coinbase Fiat Wallet", description: "Instant transfer to your Coinbase account" },
          ],
          supported_states: [
            "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"
          ],
        },
        {
          code: "DE",
          name: "Germany",
          cashout_methods: [
            { id: "SEPA_BANK_ACCOUNT", name: "SEPA Bank Transfer", description: "1-3 business days" },
            { id: "PAYPAL", name: "PayPal", description: "Available in select countries" },
            { id: "FIAT_WALLET", name: "Coinbase Fiat Wallet", description: "Instant transfer to your Coinbase account" },
          ],
        },
        {
          code: "FR",
          name: "France",
          cashout_methods: [
            { id: "SEPA_BANK_ACCOUNT", name: "SEPA Bank Transfer", description: "1-3 business days" },
            { id: "PAYPAL", name: "PayPal", description: "Available in select countries" },
            { id: "FIAT_WALLET", name: "Coinbase Fiat Wallet", description: "Instant transfer to your Coinbase account" },
          ],
        },
        {
          code: "ES",
          name: "Spain",
          cashout_methods: [
            { id: "SEPA_BANK_ACCOUNT", name: "SEPA Bank Transfer", description: "1-3 business days" },
            { id: "PAYPAL", name: "PayPal", description: "Available in select countries" },
            { id: "FIAT_WALLET", name: "Coinbase Fiat Wallet", description: "Instant transfer to your Coinbase account" },
          ],
        },
        {
          code: "IT",
          name: "Italy",
          cashout_methods: [
            { id: "SEPA_BANK_ACCOUNT", name: "SEPA Bank Transfer", description: "1-3 business days" },
            { id: "PAYPAL", name: "PayPal", description: "Available in select countries" },
            { id: "FIAT_WALLET", name: "Coinbase Fiat Wallet", description: "Instant transfer to your Coinbase account" },
          ],
        },
        {
          code: "AU",
          name: "Australia",
          cashout_methods: [
            { id: "PAYPAL", name: "PayPal", description: "Available in select countries" },
            { id: "FIAT_WALLET", name: "Coinbase Fiat Wallet", description: "Instant transfer to your Coinbase account" },
          ],
        },
      ],
    };
  }
}

/**
 * Fetches the available options for selling crypto from CDP API
 * API Docs: https://docs.cdp.coinbase.com/onramp/v1/sell/options
 */
export async function fetchSellOptions(country: string, subdivision?: string): Promise<SellOptionsResponse> {
  try {
    // Call the real CDP Sell Options API
    const params = new URLSearchParams({ country });
    if (subdivision) {
      params.append('subdivision', subdivision);
    }

    console.log('📡 Calling Sell Options API:', { country, subdivision });
    const response = await fetch(`/api/sell-options?${params.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Sell Options API failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`API call failed: ${response.status} ${errorText}`);
    }

    const apiData: ApiSellOptionsResponse = await response.json();
    console.log('📦 Raw API response:', apiData);

    // Transform CDP API response to UI-friendly format
    const transformedData = transformSellOptionsResponse(apiData);

    console.log('✅ Sell options loaded from CDP API:', {
      sellCurrenciesCount: transformedData.sell_currencies?.length || 0,
      cashoutCurrenciesCount: transformedData.cashout_currencies?.length || 0,
      assets: transformedData.sell_currencies.map(a => a.code).join(', '),
      cashoutCurrencies: transformedData.cashout_currencies.map(c => c.code).join(', '),
    });

    return transformedData;
  } catch (error) {
    console.error("⚠️ Error fetching sell options from CDP API, using fallback data:", error);
    console.warn("⚠️ Using mock data for assets and cashout methods. Real API data may differ.");
    // Fallback to mock data if API fails
    return {
      cashout_currencies: [
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
            {
              id: "PAYPAL",
              name: "PayPal",
              limits: {
                EUR: { min: "10", max: "5000" },
              },
            },
            {
              id: "FIAT_WALLET",
              name: "Coinbase Fiat Wallet",
              limits: {
                EUR: { min: "1", max: "50000" },
              },
            },
          ],
        },
        {
          code: "GBP",
          name: "British Pound",
          cashout_methods: [
            {
              id: "SEPA_BANK_ACCOUNT",
              name: "SEPA Bank Transfer",
              limits: {
                GBP: { min: "10", max: "25000" },
              },
            },
            {
              id: "PAYPAL",
              name: "PayPal",
              limits: {
                GBP: { min: "10", max: "5000" },
              },
            },
            {
              id: "FIAT_WALLET",
              name: "Coinbase Fiat Wallet",
              limits: {
                GBP: { min: "1", max: "50000" },
              },
            },
          ],
        },
        {
          code: "CAD",
          name: "Canadian Dollar",
          cashout_methods: [
            {
              id: "EFT_BANK_ACCOUNT",
              name: "EFT Bank Transfer",
              limits: {
                CAD: { min: "10", max: "25000" },
              },
            },
            {
              id: "PAYPAL",
              name: "PayPal",
              limits: {
                CAD: { min: "10", max: "5000" },
              },
            },
            {
              id: "FIAT_WALLET",
              name: "Coinbase Fiat Wallet",
              limits: {
                CAD: { min: "1", max: "50000" },
              },
            },
          ],
        },
        {
          code: "AUD",
          name: "Australian Dollar",
          cashout_methods: [
            {
              id: "PAYID",
              name: "PayID",
              limits: {
                AUD: { min: "10", max: "25000" },
              },
            },
            {
              id: "PAYPAL",
              name: "PayPal",
              limits: {
                AUD: { min: "10", max: "5000" },
              },
            },
            {
              id: "FIAT_WALLET",
              name: "Coinbase Fiat Wallet",
              limits: {
                AUD: { min: "1", max: "50000" },
              },
            },
          ],
        },
      ],
      sell_currencies: [
        {
          code: "BTC",
          name: "Bitcoin",
          networks: [{ id: "bitcoin", name: "Bitcoin" }],
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
            { id: "bnb-chain", name: "BNB Chain" }
          ],
        },
        {
          code: "SOL",
          name: "Solana",
          networks: [{ id: "solana", name: "Solana" }],
        },
        {
          code: "MATIC",
          name: "Polygon",
          networks: [
            { id: "ethereum", name: "Ethereum" },
            { id: "polygon", name: "Polygon" },
          ],
        },
        {
          code: "AVAX",
          name: "Avalanche",
          networks: [
            { id: "ethereum", name: "Ethereum" },
            { id: "avalanche-c-chain", name: "Avalanche" },
          ],
        },
        {
          code: "LINK",
          name: "Chainlink",
          networks: [
            { id: "ethereum", name: "Ethereum" },
            { id: "base", name: "Base" },
            { id: "arbitrum", name: "Arbitrum" },
          ],
        },
        {
          code: "UNI",
          name: "Uniswap",
          networks: [
            { id: "ethereum", name: "Ethereum" },
            { id: "polygon", name: "Polygon" },
          ],
        },
        {
          code: "DOGE",
          name: "Dogecoin",
          networks: [{ id: "dogecoin", name: "Dogecoin" }],
        },
        {
          code: "SHIB",
          name: "Shiba Inu",
          networks: [{ id: "ethereum", name: "Ethereum" }],
        },
        {
          code: "XRP",
          name: "XRP",
          networks: [{ id: "ripple", name: "XRP Ledger" }],
        },
        {
          code: "LTC",
          name: "Litecoin",
          networks: [{ id: "litecoin", name: "Litecoin" }],
        },
        {
          code: "BCH",
          name: "Bitcoin Cash",
          networks: [{ id: "bitcoin-cash", name: "Bitcoin Cash" }],
        },
      ],
    };
  }
}
