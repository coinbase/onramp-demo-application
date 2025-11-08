# Coinbase On/Off Ramp Demo

A Next.js application demonstrating the integration of Coinbase's On-ramp and Off-ramp services, allowing users to easily convert between fiat and cryptocurrency.

## Features

- **Coinbase Onramp Integration**: Allows users to purchase crypto with fiat currency
- **Coinbase Offramp Integration**: Enables users to convert crypto back to fiat
  - ⚠️ **Important**: Offramp requires a Coinbase account with linked bank details. Guest checkout is NOT supported for fiat withdrawals.
- **Apple Pay Onramp**: Fast, native Apple Pay integration with iframe embedding
- **Secure Initialization**: Support for session tokens for enhanced security
- **Wallet Connection**: Integrates with Web3 wallets via WalletConnect
- **Responsive Design**: Modern UI that works across devices
- **Multiple Integration Options**:
  - **Fund Card**: Pre-built UI component from Coinbase
  - **Custom Integration**: Fully customizable UI with enhanced dropdown options
  - **Apple Pay**: Native Apple Pay experience with embedded iframe

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/coinbase/onramp-demo-application.git
   cd onramp-demo-application
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables:

   Copy the `.env.example` file to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

4. Obtain the necessary API keys from the [Coinbase Developer Platform Dashboard](https://portal.cdp.coinbase.com/):

   - **CDP Project ID**: Your public project identifier (found in Projects dashboard)
   - **CDP Secret API Key**: Create from API Keys > Secret API Keys (select Ed25519 format)
   - **CDP API Private Key**: The base64-encoded private key from the API key creation

5. Add your API keys to the `.env.local` file:

   ```bash
   # ==============================================
   # PUBLIC ENVIRONMENT VARIABLES (safe to expose)
   # ==============================================

   # CDP Project ID - This is your public project identifier
   # Get from: https://portal.cdp.coinbase.com/
   NEXT_PUBLIC_CDP_PROJECT_ID="your_project_id_here"

   # Project Name (optional)
   NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME="Coinbase Ramp Demo"

   # ==============================================
   # PRIVATE ENVIRONMENT VARIABLES (server-side only)
   # ==============================================

   # CDP Secret API Key Name/ID
   # Get from: https://portal.cdp.coinbase.com/access/api
   # When creating the key, select "Ed25519" as the signature algorithm (recommended)
   # Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   CDP_API_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

   # CDP API Private Key (Ed25519 format - recommended)
   # Copy the base64-encoded key from CDP Portal
   # Format: A long base64 string ending with "=="
   CDP_API_SECRET="your-base64-encoded-ed25519-private-key-here=="

   # ==============================================
   # OPTIONAL
   # ==============================================

   # CORS Origins - Comma-separated list of allowed origins
   # Add your production domain(s) here for Apple Pay and custom integrations
   ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001,https://yourdomain.com"

   # Node environment
   NODE_ENV=development
   ```

   > **IMPORTANT**: Never commit your API keys to the repository. The `.env.local` file is included in `.gitignore` to prevent accidental exposure.

6. Start the development server

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Security Requirements (Coinbase CDP)

This demo implements **required security measures** as specified by Coinbase Developer Platform:

### CORS Protection (Required)

All session token API endpoints implement CORS headers to prevent unauthorized access:

- ✅ Only allows requests from approved origins
- ✅ Rejects requests from unauthorized domains  
- ✅ Prevents malicious websites from hijacking your API

**Configuration:**

The API endpoints (`/api/session` and `/api/fund/session`) automatically:
- Allow `localhost:3000` and `localhost:3001` for development
- Check the `ALLOWED_ORIGINS` environment variable for production domains

**For Production:** The following domains are configured by default:
- `https://onramp-demo-application-git-main-coinbase-vercel.vercel.app`
- `https://www.onrampdemo.com`

To add additional domains, set the `ALLOWED_ORIGINS` environment variable:
```bash
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

### Rate Limiting (Implemented)

- ✅ 10 requests per minute for `/api/session`
- ✅ 20 requests per minute for `/api/fund/session`
- ✅ Per-IP tracking to prevent abuse

### Input Validation (Implemented)

- ✅ Zod schema validation on all inputs
- ✅ Address format validation
- ✅ Blockchain network validation

### Secure Logging (Implemented)

- ✅ No sensitive data (API keys, tokens) in logs
- ✅ Structured logging for security events
- ✅ Request tracking for audit purposes

**⚠️ Important:** These security measures are **required** by Coinbase to prevent unauthorized usage of onramp sessions. Failure to implement these measures may result in unauthorized access to your integration.

For more information, see: [Coinbase Security Requirements](https://docs.cdp.coinbase.com/onramp/docs/security-requirements)

## Secure Initialization (Session Tokens)

This demo now supports secure initialization using session tokens, which provides enhanced security for onramp and offramp transactions.

### What are Session Tokens?

Session tokens are short-lived, one-time-use tokens that authenticate users and manage sessions securely. When enabled, the application generates a session token server-side before initiating the onramp/offramp flow.

### Benefits of Using Session Tokens

- **Enhanced Security**: API credentials are never exposed to the client
- **Better Control**: Server-side validation before initiating transactions
- **Compliance**: Meets security requirements for production applications

### How to Enable Secure Initialization

1. **Set up CDP API Credentials**: Add your CDP API key and secret to your `.env.local` file:
   ```
   CDP_API_KEY="your_cdp_api_key"
   CDP_API_SECRET="your_cdp_api_secret"
   ```

2. **Toggle Secure Initialization**: In both the Onramp and Offramp features, you'll find a "Use Secure Initialization" checkbox. Enable it to use session tokens.

3. **Implementation Example**:
   ```typescript
   // Generate a session token
   const response = await fetch('/api/session', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       addresses: [{
         address: "0x...",
         blockchains: ["ethereum", "base"]
       }],
       assets: ["ETH", "USDC"]
     }),
   });
   
   const { token } = await response.json();
   
   // Use the token in your onramp URL
   const url = generateOnrampURL({
     sessionToken: token,
     // other optional UI params...
   });
   ```

### Important Notes

- Session tokens expire quickly and can only be used once
- When using session tokens, you don't need to pass `appId`, `addresses`, or `assets` in the URL
- The secure initialization option is available in both Onramp and Offramp features

## Offramp Implementation

This demo uses the **One-Click-Sell Offramp approach** via the [Sell Quote API](https://docs.cdp.coinbase.com/onramp-&-offramp/offramp-apis/generating-quotes). When you include `source_address`, `redirect_url`, and `partner_user_id` in the quote request, the API returns a ready-to-use URL with all parameters pre-filled (sessionToken, defaultAsset, presetFiatAmount, quoteId, defaultCashoutMethod).

Users are taken directly to the order preview screen on Coinbase Pay!

### Dynamic Configuration via CDP APIs

The offramp UI now dynamically loads:
- **Supported countries and payment methods** via [Sell Config API](https://docs.cdp.coinbase.com/api-reference/rest-api/onramp-offramp/get-sell-config) (`GET /v1/sell/config`)
- **Available crypto assets and fiat currencies** via [Sell Options API](https://docs.cdp.coinbase.com/api-reference/rest-api/onramp-offramp/get-sell-options) (`GET /v1/sell/options`)

This ensures dropdown options always reflect what Coinbase actually supports in each country. Check the browser console for confirmation of API data loading vs. fallback data.

### Offramp Requirements

⚠️ **CRITICAL: Coinbase Account Required for Offramp**

Unlike onramp (which supports guest checkout), **offramp transactions require users to have a Coinbase account with linked bank details**. This is a Coinbase requirement, not a limitation of this demo app.

### What Users Need for Offramp

To successfully complete an offramp (cash-out) transaction, users MUST have:

1. **Active Coinbase Account**
   - Sign up at [coinbase.com](https://www.coinbase.com)
   - Guest checkout is NOT supported for fiat withdrawals

2. **Identity Verification**
   - Complete Coinbase's KYC (Know Your Customer) verification
   - This is required by financial regulations

3. **Linked Payment Method**
   - For ACH transfers: Link a US bank account in Coinbase
   - For PayPal: Connect PayPal account in Coinbase settings
   - For SEPA: Link European bank account (Europe only)

4. **Crypto Assets**
   - Have the cryptocurrency you want to sell in your connected wallet
   - Assets must be on the correct blockchain network
   - Sufficient balance to cover the transaction amount

### Common Reasons Offramp May Fail

If clicking "Cash Out Now" doesn't complete the transaction, it's usually because:

- ❌ User doesn't have a Coinbase account
- ❌ Bank account/payment method not linked in Coinbase
- ❌ Identity verification incomplete
- ❌ Insufficient crypto balance in wallet
- ❌ Crypto is on wrong network
- ❌ Transaction was cancelled by user

### Testing Offramp

To test offramp in this demo:

1. Create a Coinbase account if you don't have one
2. Complete identity verification
3. Link your bank account or PayPal
4. Ensure you have crypto (USDC, ETH, etc.) in your connected wallet
5. Make sure the asset is on the network you selected

**Note**: This is a real transaction if all requirements are met. Only test with amounts you're comfortable cashing out.

## Integration Options

### Fund Card

The Fund Card provides a pre-built UI component from Coinbase that handles the entire on-ramp process with minimal configuration.

#### Troubleshooting FundCard Issues

If you're experiencing issues with the FundCard component:

1. **400 Bad Request Error**:

   - Ensure your CDP Project ID is correctly set in the `.env.local` file as both `NEXT_PUBLIC_CDP_PROJECT_ID` and `CDP_PROJECT_ID`
   - Verify that your OnchainKit API Key is valid and active
   - Check that your wallet is connected to the correct network (Base is recommended)
   - Look for detailed error messages in the browser console

2. **Wallet Connection Issues**:

   - Make sure your WalletConnect Project ID is correctly set
   - Try disconnecting and reconnecting your wallet
   - Ensure you're using a compatible wallet (Coinbase Wallet is recommended)

3. **Testing with Simplified Components**:

   - Visit `/basic-fund` to test a minimal FundCard implementation
   - Visit `/simple-fund` to test a FundCard with CDP Project ID handling

4. **Environment Variable Verification**:
   - Both client-side (`NEXT_PUBLIC_*`) and server-side variables must be set
   - The CDP Project ID must be set as both `NEXT_PUBLIC_CDP_PROJECT_ID` (client-side) and `CDP_PROJECT_ID` (server-side)
   - The API route at `/api/auth` must return a valid CDP Project ID
   - Make sure your OnchainKit API Key is set as both `NEXT_PUBLIC_ONCHAINKIT_API_KEY` (client-side) and `ONCHAINKIT_API_KEY` (server-side)

### Custom Integration

The Custom Integration demo showcases a fully customizable UI that gives you complete control over the user experience. Recent enhancements include:

- **Expanded Currency Options**: Support for USD, EUR, GBP, CAD, AUD, JPY, CHF, SGD
- **Multiple Cryptocurrency Assets**: USDC, ETH, BTC, SOL, MATIC, AVAX, LINK, UNI, AAVE, DAI
- **Diverse Network Support**: Base, Ethereum, Optimism, Arbitrum, Polygon, Avalanche, Solana, BNB Chain
- **Comprehensive Payment Methods**: Card, Bank, Apple Pay, Google Pay, PayPal, Coinbase, ACH, SEPA, iDEAL, SOFORT
- **Global Coverage**: Support for multiple countries including US, UK, Canada, Australia, Germany, France, Spain, Italy, Netherlands, Switzerland, Singapore, Japan

## Tech Stack

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- @coinbase/onchainkit
- wagmi

## Deployment

This project can be easily deployed on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcoinbase%2Fonramp-demo-application)

When deploying, make sure to set up the environment variables in your Vercel project settings.

## Repository Information

This repository is maintained by Coinbase and serves as a demonstration of how to integrate Coinbase's On/Off Ramp services into your application. For more information about Coinbase Developer Platform, visit [Coinbase Developer Platform](https://portal.cdp.coinbase.com/).

### Contributing

Contributions to this demo application are welcome. Please feel free to submit issues or pull requests to improve the demonstration.

## Recent Updates

- **Enhanced Custom Integration**: Added comprehensive dropdown options for countries, currencies, payment methods, and networks
- **Improved Type Safety**: Fixed TypeScript type issues for better reliability
- **UI Enhancements**: Updated styling for better user experience

## Troubleshooting

### Common Issues

1. **API Key Issues**:
   - Ensure all API keys are correctly set in your `.env.local` file
   - Verify that your API keys are active and have the correct permissions
   - Make sure your CDP_PROJECT_ID and NEXT_PUBLIC_CDP_PROJECT_ID are correctly set and match
   - Check for any whitespace or quotes that might be causing issues

2. **Wallet Connection Problems**:
   - Try disconnecting and reconnecting your wallet
   - Ensure you're using a compatible wallet (Coinbase Wallet is recommended)
   - Check that you're connected to the correct network

3. **Build or Runtime Errors**:
   - Make sure you're using Node.js 18 or higher
   - Try clearing your browser cache or using incognito mode
   - Run `npm install` again to ensure all dependencies are properly installed

If you encounter any other issues, please check the [Issues](https://github.com/coinbase/onramp-demo-application/issues) section of the repository or create a new issue.

## License

MIT
