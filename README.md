# Coinbase On/Off Ramp Demo

A Next.js application demonstrating the integration of Coinbase's On-ramp and Off-ramp services, allowing users to easily convert between fiat and cryptocurrency.

## Features

- **Coinbase Onramp Integration**: Allows users to purchase crypto with fiat currency
- **Coinbase Offramp Integration**: Enables users to convert crypto back to fiat
- **Secure Initialization**: Support for session tokens for enhanced security
- **Wallet Connection**: Integrates with Web3 wallets via WalletConnect
- **Responsive Design**: Modern UI that works across devices
- **Multiple Integration Options**:
  - **Fund Card**: Pre-built UI component from Coinbase
  - **Custom Integration**: Fully customizable UI with enhanced dropdown options

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

4. Obtain the necessary API keys:

   - **Onchain Kit API Key**: Get this from the [Coinbase Developer Platform Dashboard](https://portal.cdp.coinbase.com/)
   - **CDP Project ID**: Get this from the [Coinbase Developer Platform Dashboard](https://portal.cdp.coinbase.com/)
   - **CDP API Keys**: Get these from the [Coinbase Developer Platform Dashboard](https://portal.cdp.coinbase.com/)
   - **Iron Password**: Create a secure password (at least 32 characters) for session encryption

5. Add your API keys to the `.env.local` file:

   ```
   # Client-side variables (accessible in browser)
   NEXT_PUBLIC_ONCHAINKIT_API_KEY="your_onchainkit_api_key"
   NEXT_PUBLIC_CDP_PROJECT_ID="your_cdp_project_id"
   
   # Server-side variables (not accessible in browser)
   IRON_PASSWORD="your_secure_password_at_least_32_chars_long"
   CDP_API_KEY_NAME="your_cdp_api_key_name"
   CDP_API_KEY_PRIVATE_KEY="your_cdp_api_private_key"
   CDP_PROJECT_ID="your_cdp_project_id"
   ONCHAINKIT_API_KEY="your_onchainkit_api_key"
   
   # For Secure Initialization (Session Tokens)
   CDP_API_KEY="your_cdp_api_key"
   CDP_API_SECRET="your_cdp_api_secret"
   ```

   > **IMPORTANT**: Never commit your API keys to the repository. The `.env.local` file is included in `.gitignore` to prevent accidental exposure.

6. Start the development server

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

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
