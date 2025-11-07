"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import { useCoinbaseRampTransaction } from "../contexts/CoinbaseRampTransactionContext";
import confetti from "canvas-confetti";

interface ApplePayOrder {
  paymentLinkUrl: string;
  orderId: string;
  partnerUserRef?: string;
}

interface TransactionDetails {
  amount: string;
  asset: string;
  network: string;
  destinationAddress: string;
  orderId?: string;
  txHash?: string;
}

export default function ApplePayFeature() {
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();
  const { rampTransaction, authenticated } = useCoinbaseRampTransaction();
  
  // Use embedded wallet address if available, otherwise fall back to wagmi wallet
  const address = rampTransaction?.wallet || wagmiAddress;
  const isConnected = authenticated || wagmiConnected;
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("20");
  const [asset, setAsset] = useState("USDC");
  const [network, setNetwork] = useState("base");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [eventLogs, setEventLogs] = useState<string[]>([]);
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  // Use refs to avoid useEffect dependencies that cause re-renders
  const amountRef = useRef(amount);
  const assetRef = useRef(asset);
  const networkRef = useRef(network);
  const destinationAddressRef = useRef(destinationAddress);
  const currentOrderIdRef = useRef(currentOrderId);

  // Update refs when values change
  useEffect(() => {
    amountRef.current = amount;
    assetRef.current = asset;
    networkRef.current = network;
    destinationAddressRef.current = destinationAddress;
    currentOrderIdRef.current = currentOrderId;
  }, [amount, asset, network, destinationAddress, currentOrderId]);

  // Update destination address when wallet connects
  useEffect(() => {
    if (address) {
      setDestinationAddress(address);
    }
  }, [address]);

  // Listen for post message events from the iframe
  // Use useCallback to create a stable handler that won't cause re-renders
  const handleMessage = useCallback((event: MessageEvent) => {
      // Only accept messages from Coinbase
      if (!event.origin.includes('coinbase.com')) return;

      // Parse the event data if it's a string (Coinbase sends JSON strings)
      let parsedData;
      try {
        parsedData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch (e) {
        console.error('Failed to parse postMessage data:', e);
        return;
      }

      // Check if parsedData has the expected structure
      if (!parsedData || typeof parsedData !== 'object') return;

      const { eventName, data } = parsedData;

      // Skip if no eventName
      if (!eventName) return;

      console.log('✅ Apple Pay Event:', eventName, data);
      
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
        // Payment successful! Show success message in the same modal
        // Use refs to get current values without causing re-renders
        setTransactionDetails({
          amount: amountRef.current,
          asset: assetRef.current,
          network: networkRef.current,
          destinationAddress: destinationAddressRef.current,
          orderId: currentOrderIdRef.current || undefined,
          txHash: data?.txHash || undefined,
        });
        setShowSuccessModal(true);
        // Keep payment modal open, but success content will show instead

        // Trigger confetti animation
        const duration = 3000;
        const end = Date.now() + duration;

        const colors = ['#0052FF', '#5B8DEF', '#00D395', '#FFB800'];

        (function frame() {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
      }
    }, []); // Empty dependency array - handler is stable and won't re-create

  // Set up the event listener once
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]); // Only depends on the stable handleMessage function

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

      // Save order ID for transaction tracking
      setCurrentOrderId(data.orderId);

      // Original URL from API
      const originalUrl = data.paymentLinkUrl;

      // IMPORTANT: useApplePaySandbox=true is ONLY needed for localhost testing
      // Per engineering guidance: "Localhost will never work with Apple Pay,
      // to test iframe integration locally add the query param 'useApplePaySandbox=true'"
      //
      // For production HTTPS domains: Use original URL without the sandbox param
      // For localhost: Add sandbox param to bypass domain validation (for testing only)
      const isLocalhost = window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1';

      const iframeUrl = isLocalhost
        ? `${originalUrl}${originalUrl.includes('?') ? '&' : '?'}useApplePaySandbox=true`
        : originalUrl;

      console.log('Apple Pay order created successfully');
      console.log('Environment:', isLocalhost ? 'localhost' : 'production');
      console.log('Payment URL:', iframeUrl);

      setIframeUrl(iframeUrl); // Set iframe URL to show natively
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

            {!isConnected ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Please connect your wallet to continue
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Show Success Message if payment completed */}
                {showSuccessModal && transactionDetails ? (
                  <div className="text-center">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Sandbox Badge */}
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 mb-4">
                      <span className="text-yellow-700 dark:text-yellow-300 text-sm font-medium">
                        🧪 Sandbox Transaction - No Real Funds
                      </span>
                    </div>

                    <p className="text-center text-gray-600 dark:text-gray-400 mb-6 text-lg">
                      🎉 Test transaction completed successfully!
                    </p>

                    {/* Transaction Details */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3 mb-6 text-left">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Amount</span>
                        <span className="font-semibold">${transactionDetails.amount} USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Asset</span>
                        <span className="font-semibold">{transactionDetails.asset}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Network</span>
                        <span className="font-semibold capitalize">{transactionDetails.network}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 dark:text-gray-400">To</span>
                        <span className="font-mono text-xs font-semibold break-all text-right max-w-[300px]">
                          {transactionDetails.destinationAddress}
                        </span>
                      </div>
                      {transactionDetails.orderId && (
                        <div className="flex justify-between items-start">
                          <span className="text-gray-600 dark:text-gray-400">Order ID</span>
                          <span className="font-mono text-xs font-semibold break-all text-right max-w-[300px]">
                            {transactionDetails.orderId}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          Test Completed ✓
                        </span>
                      </div>
                      {transactionDetails.txHash && transactionDetails.txHash !== '0x' ? (
                        <div className="flex justify-between items-start">
                          <span className="text-gray-600 dark:text-gray-400">Tx Hash</span>
                          <a
                            href={`https://basescan.org/tx/${transactionDetails.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all text-right max-w-[300px]"
                          >
                            View on BaseScan →
                          </a>
                        </div>
                      ) : (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center">
                            In sandbox mode, no real blockchain transaction occurs.
                            <br />
                            In production, you'll receive a transaction hash here.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Done Button */}
                    <button
                      onClick={() => {
                        setShowSuccessModal(false);
                        setTransactionDetails(null);
                        setIframeUrl(null);
                        // Reset form
                        setEmail("");
                        setPhoneNumber("");
                        setAmount("20");
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                    >
                      Start New Transaction
                    </button>
                  </div>
                ) : iframeUrl ? (
                  /* Show Apple Pay iframe natively */
                  <div className="space-y-4">
                    {/* Show error if any */}
                    {error && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Apple Pay iframe embedded natively */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      <iframe
                        src={iframeUrl}
                        className="w-full h-[500px] border-0"
                        title="Apple Pay Purchase"
                        allow="payment"
                        onLoad={() => {
                          console.log('Apple Pay iframe loaded');
                          setEventLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Apple Pay ready`]);
                          setIsLoading(false);
                        }}
                        onError={(e) => {
                          console.error('Iframe error:', e);
                          setError('Failed to load Apple Pay. Try refreshing.');
                          setIsLoading(false);
                        }}
                      />
                    </div>

                    {/* Back button */}
                    <button
                      onClick={() => {
                        setIframeUrl(null);
                        setIsLoading(false);
                        setError(null);
                      }}
                      className="w-full text-center py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                    >
                      ← Back to Form
                    </button>
                  </div>
                ) : (
                  /* Show form */
                  <>
                    {/* Show error if any */}
                    {error && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                        {error}
                      </div>
                    )}

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
                        readOnly
                        placeholder="0x..."
                        className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 cursor-not-allowed font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Using your connected wallet address</p>
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

                    {/* Configuration Display */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
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
                      onClick={handleCreateOrder}
                      disabled={isLoading || !email || !phoneNumber || !destinationAddress}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:scale-100 shadow-lg disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Creating Order..." : "Add Funds with Apple Pay"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

