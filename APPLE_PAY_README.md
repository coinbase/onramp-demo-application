# Apple Pay Onramp Integration

This demo application now includes Apple Pay onramp integration, providing the fastest onramp experience available.

## Features

- 🍎 **Native Apple Pay Experience** - Complete purchases without leaving your app
- 🔒 **Sandbox Mode** - Test without real charges using `sandbox-` prefix
- 📱 **Iframe Integration** - Apple Pay button and QR code displayed via Coinbase iframe
- 📲 **Built-in QR Code** - QR code provided directly from Coinbase API when clicked on desktop
- ✅ **US Only** - Currently supports US users with valid US phone numbers
- ⚡ **Fast Setup** - Simple configuration with CDP API keys

## Setup

### Prerequisites

1. CDP API credentials (Secret API Key)
2. Environment variables configured:
   - `CDP_API_KEY` or `CDP_API_KEY_NAME`
   - `CDP_API_SECRET` or `CDP_API_KEY_PRIVATE_KEY`

### Installation

The required dependencies are already included:
- `@coinbase/cdp-sdk` - CDP authentication
- No additional packages needed!

## How It Works

### Flow

1. **User connects wallet** on the Apple Pay page
2. **User clicks "Add Funds"** which opens a configuration modal
3. **User fills in details**:
   - Email (must be verified in production)
   - Phone number (US format: +1XXXXXXXXXX)
   - Destination address (auto-filled from wallet)
   - Amount, asset, and network
4. **System generates order** via CDP v2 Order API and receives `paymentLinkUrl`
5. **Iframe loads** the payment link showing the Apple Pay button from Coinbase
6. **User clicks Apple Pay button** in the iframe:
   - On iPhone: Opens Apple Pay directly
   - On desktop: Shows QR code from Coinbase to scan with iPhone
7. **Apple Pay completes** purchase on device

### Sandbox Mode

All orders are created with `sandbox-` prefix in `partnerUserRef`, ensuring:
- ✅ No real charges
- ✅ Transactions always succeed
- ✅ Full testing capability
- ✅ Any valid US phone format accepted

## API Endpoints

### POST `/api/apple-pay/order`

Creates an Apple Pay onramp order.

**Request Body:**
```json
{
  "email": "user@example.com",
  "phoneNumber": "+12345678901",
  "amount": 20,
  "asset": "USDC",
  "network": "base",
  "destinationAddress": "0x..."
}
```

**Response:**
```json
{
  "orderId": "order_xyz",
  "paymentLinkUrl": "https://pay.coinbase.com/...",
  "partnerUserRef": "sandbox-user-1234567890"
}
```

## Requirements

### Development
- Any valid US phone number format for testing
- Email can be any valid email format

### Production
- Email must be verified via OTP (e.g., Twilio, AWS SES)
- Phone number must be verified via OTP
- Phone must be real cell phone (not VoIP)
- Phone verification required every 60 days
- Users must accept Coinbase Terms of Service

### Platform Requirements
- US users only
- iOS 18 or later for Apple Pay
- Webview integration for native apps

## Testing

1. Navigate to `/apple-pay` page
2. Connect your wallet
3. Click "Add Funds with Apple Pay"
4. Fill in the form with test data:
   - Email: `test@example.com`
   - Phone: `+12345678901`
   - Amount: `20`
   - Asset: `USDC`
   - Network: `base`
5. Click "Buy with Apple Pay"
6. **Iframe loads** with Apple Pay button
7. Click the Apple Pay button in the iframe:
   - **On iPhone**: Proceeds directly to Apple Pay
   - **On desktop**: Shows QR code to scan with iPhone Camera app
8. Complete Apple Pay flow on your iPhone

## Security Considerations

✅ **Implemented:**
- JWT authentication with CDP API
- Rate limiting (10 requests/minute)
- Input validation with proper formats
- Sandbox mode for safe testing
- Server-side order creation only

⚠️ **Production Requirements:**
- Implement OTP verification for email
- Implement OTP verification for phone
- Re-verify phone every 60 days
- Display Coinbase Terms of Service
- Ensure user acceptance of terms

## File Structure

```
app/
├── apple-pay/
│   └── page.tsx                      # Apple Pay page
├── components/
│   └── ApplePayFeature.tsx           # Main Apple Pay component
├── api/
│   └── apple-pay/
│       └── order/
│           └── route.ts              # Order creation API
```

## Troubleshooting

### "Server configuration error"
- Check that `CDP_API_KEY` and `CDP_API_SECRET` are set in environment variables

### "Invalid phone number format"
- Phone must be in format `+1XXXXXXXXXX` (US only)
- Example: `+12345678901`

### "Failed to create order"
- Check CDP API credentials are correct
- Verify network connectivity
- Check server logs for detailed error messages

### Iframe not loading
- Check that the `paymentLinkUrl` is valid
- Ensure iframe sandbox permissions are correct
- Check browser console for errors

### Apple Pay button not showing
- The button is rendered by Coinbase's iframe
- May require iOS/Safari for full functionality
- On desktop, click the button to see QR code

### QR code not working
- The QR code is provided by Coinbase when you click the Apple Pay button on desktop
- Ensure you're scanning with iPhone Camera app
- Requires iOS 18 or later

## Documentation

- [Apple Pay Onramp API Docs](https://docs.cdp.coinbase.com/onramp/docs/apple-pay-onramp-api)
- [CDP Authentication](https://docs.cdp.coinbase.com/api-reference/v2/authentication)
- [Create Onramp Order API](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/onramp/create-an-onramp-order)

## Support

For issues or questions:
- [CDP Discord](https://discord.com/invite/cdp)
- [Schedule a call with Coinbase team](https://calendar.app.google/BLn6fzaz2aCZGvLu7)

