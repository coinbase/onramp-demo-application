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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("20");
  const [asset, setAsset] = useState("USDC");
  const [network, setNetwork] = useState("base");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentLinkUrl, setPaymentLinkUrl] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [eventLogs, setEventLogs] = useState<string[]>([]);

  // Update destination address when wallet connects
  useEffect(() => {
    if (address) {
      setDestinationAddress(address);
    }
  }, [address]);

  // Listen for post message events from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Coinbase
      if (!event.origin.includes('coinbase.com')) return;

      // Check if event.data has the expected structure
      if (!event.data || typeof event.data !== 'object') return;
      
      const { eventName, data } = event.data;
      
      // Skip if no eventName
      if (!eventName) return;
      
      const timestamp = new Date().toLocaleTimeString();
      const logMessage = `[${timestamp}] ${eventName}${data?.errorMessage ? ` - ${data.errorMessage}` : ''}${data?.errorCode ? ` (${data.errorCode})` : ''}`;
      
      setEventLogs(prev => [...prev, logMessage]);

      // Handle specific events
      if (eventName === 'onramp_api.load_error' || eventName === 'onramp_api.commit_error' || eventName === 'onramp_api.polling_error') {
        setError(data?.errorMessage || 'An error occurred');
      } else if (eventName === 'onramp_api.commit_success') {
        setError(null);
      } else if (eventName === 'onramp_api.polling_success') {
        setError(null);
        alert('Transaction completed successfully! 🎉');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
      
      // Original URL from API
      const originalUrl = data.paymentLinkUrl;
      
      // IMPORTANT: For sandbox mode (backend uses sandbox- prefix in partnerUserRef),
      // we must append useApplePaySandbox=true to bypass domain validation.
      // This applies to ALL environments (localhost AND production) during sandbox testing.
      // Per internal engineering guidance: this parameter is required for iframe integration
      // when testing with sandbox orders.
      const iframeSandboxUrl = `${originalUrl}${originalUrl.includes('?') ? '&' : '?'}useApplePaySandbox=true`;
      
      console.log('Apple Pay order created successfully');
      console.log('Original URL:', originalUrl);
      console.log('Sandbox iframe URL:', iframeSandboxUrl);
      
      setPaymentLinkUrl(originalUrl); // For popup
      setIframeUrl(iframeSandboxUrl); // For iframe
      setShowModal(false);
      setShowPaymentModal(true); // Open payment modal
      setEventLogs([
        `[${new Date().toLocaleTimeString()}] Order created successfully`,
        `[${new Date().toLocaleTimeString()}] Loading Apple Pay button...`
      ]);
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
              <li>✓ Apple Pay button embedded directly in iframe</li>
              <li>✓ Sandbox mode enabled for testing (no charges)</li>
              <li>✓ Localhost testing enabled with useApplePaySandbox=true</li>
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

          {/* Payment Modal - Porto Style */}
          {showPaymentModal && iframeUrl && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Add funds</h2>
                    <button
                      onClick={() => {
                        setShowPaymentModal(false);
                        setPaymentLinkUrl(null);
                        setIframeUrl(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Select deposit method
                  </p>

                  {/* Apple Pay iframe */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-4">
                    <iframe
                      src={iframeUrl}
                      className="w-full h-[400px] border-0"
                      title="Apple Pay Purchase"
                      allow="payment"
                      onLoad={() => {
                        console.log('Iframe loaded successfully');
                        setEventLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Apple Pay button ready`]);
                      }}
                      onError={(e) => {
                        console.error('Iframe error:', e);
                        setEventLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error loading iframe`]);
                      }}
                    />
                  </div>

                  {/* Event log - compact version */}
                  {eventLogs.length > 0 && (
                    <div className="mb-4">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600 dark:text-gray-400 mb-2">
                          Event Log ({eventLogs.length})
                        </summary>
                        <div className="bg-black text-green-400 p-3 rounded font-mono text-xs max-h-32 overflow-y-auto">
                          {eventLogs.map((log, i) => (
                            <div key={i} className="mb-1 break-words">{log}</div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}

                  {/* Back button */}
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentLinkUrl(null);
                      setIframeUrl(null);
                    }}
                    className="w-full text-center py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Back
                  </button>
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

