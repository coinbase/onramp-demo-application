"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

interface ApplePayOrder {
  paymentLinkUrl: string;
  orderId: string;
}

export default function ApplePayFeature() {
  const { address, isConnected } = useAccount();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("20");
  const [asset, setAsset] = useState("USDC");
  const [network, setNetwork] = useState("base");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentLinkUrl, setPaymentLinkUrl] = useState<string | null>(null);

  // Update destination address when wallet connects
  useEffect(() => {
    if (address) {
      setDestinationAddress(address);
    }
  }, [address]);

  const handleAddFunds = () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    setShowModal(true);
    setError(null);
    setPaymentLinkUrl(null);
  };

  const handleCreateOrder = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Validate inputs
      if (!email || !phoneNumber || !destinationAddress) {
        throw new Error("Please fill in all required fields");
      }

      if (!phoneNumber.match(/^\+1\d{10}$/)) {
        throw new Error("Phone number must be in format +1XXXXXXXXXX (US only)");
      }

      // Call backend API to create the Apple Pay order
      const response = await fetch('/api/apple-pay/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phoneNumber,
          amount: parseFloat(amount),
          asset,
          network,
          destinationAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const data: ApplePayOrder = await response.json();
      setPaymentLinkUrl(data.paymentLinkUrl);
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Info Banner */}
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-3 text-lg">
              🍎 Apple Pay Onramp - Native Experience
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <li>✓ Fastest onramp experience available</li>
              <li>✓ US users only (valid US phone number required)</li>
              <li>✓ Scan QR code with iPhone to complete purchase</li>
              <li>✓ Sandbox mode enabled for testing (no charges)</li>
            </ul>
          </div>

          {/* Requirements Banner */}
          <div className="mb-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-3">
              📋 Requirements
            </h3>
            <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
              <li>• Email and phone must be verified via OTP (in production)</li>
              <li>• Phone must be re-verified every 60 days</li>
              <li>• Users must accept Coinbase's Terms of Service</li>
              <li>• For testing: Any valid US phone format (+1XXXXXXXXXX)</li>
            </ul>
          </div>

          {/* Demo Card */}
          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Try Apple Pay Onramp
            </h2>

            <div className="space-y-6">
              {/* Current Configuration Display */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4 text-lg">Configuration</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="ml-2 font-medium">${amount} USD</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Asset:</span>
                    <span className="ml-2 font-medium">{asset}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Network:</span>
                    <span className="ml-2 font-medium capitalize">{network}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Mode:</span>
                    <span className="ml-2 font-medium text-green-600">Sandbox</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleAddFunds}
                disabled={!isConnected}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:scale-100 shadow-lg disabled:cursor-not-allowed"
              >
                {isConnected ? "Add Funds with Apple Pay" : "Connect Wallet First"}
              </button>

              {!isConnected && (
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Please connect your wallet to continue
                </p>
              )}
            </div>
          </div>

          {/* Apple Pay Link Display */}
          {paymentLinkUrl && (
            <div className="mt-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Apple Pay Order Created!</h2>
                <button
                  onClick={() => setPaymentLinkUrl(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Your Apple Pay order has been created successfully. Click the button below to open the payment page.
                  </p>
                  
                  <button
                    onClick={() => window.open(paymentLinkUrl, '_blank', 'width=500,height=700')}
                    className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-4 px-6 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Open Apple Pay</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    💡 <strong>Tip:</strong> The payment page will open in a new window. On desktop, it will show a QR code to scan with your iPhone. On iOS devices, it will show the Apple Pay button directly.
                  </p>
                </div>
                
                <div className="text-center">
                  <a 
                    href={paymentLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    Or copy this link: {paymentLinkUrl.substring(0, 60)}...
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add Funds</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Select deposit method
              </p>

              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email (Verified) *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number (US) *
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+12345678901"
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: +1XXXXXXXXXX</p>
                </div>

                {/* Destination Address */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Destination Address *
                  </label>
                  <input
                    type="text"
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Asset */}
                <div>
                  <label className="block text-sm font-medium mb-2">Asset</label>
                  <select
                    value={asset}
                    onChange={(e) => setAsset(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USDC">USDC</option>
                    <option value="ETH">ETH</option>
                    <option value="BTC">BTC</option>
                  </select>
                </div>

                {/* Network */}
                <div>
                  <label className="block text-sm font-medium mb-2">Network</label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="base">Base</option>
                    <option value="ethereum">Ethereum</option>
                    <option value="polygon">Polygon</option>
                  </select>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCreateOrder}
                  disabled={isLoading || !destinationAddress}
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-4 px-6 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Creating Order..." : "Buy with Apple Pay"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

