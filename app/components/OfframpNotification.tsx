"use client";

import React, { useState, useEffect } from "react";

interface OfframpNotificationProps {
  status: string;
  onClose: () => void;
}

export default function OfframpNotification({
  status,
  onClose,
}: OfframpNotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 10 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Handle different status types
  const getNotificationContent = () => {
    switch (status) {
      case "success":
        return {
          title: "Transaction Successful! 🎉",
          message:
            "Your crypto has been successfully cashed out. The funds should arrive in your account according to your selected payment method timeline.",
          icon: (
            <svg
              className="w-6 h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          ),
          bgColor: "bg-green-50",
          borderColor: "border-green-400",
          textColor: "text-green-800",
        };
      case "pending":
        return {
          title: "Transaction Pending",
          message:
            "Your offramp transaction is being processed. Please check your wallet and payment method for updates.",
          icon: (
            <svg
              className="w-6 h-6 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          ),
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-400",
          textColor: "text-yellow-800",
        };
      case "error":
        return {
          title: "Transaction Failed",
          message:
            "There was an error processing your offramp transaction. This could be due to insufficient funds, network issues, or other technical problems. Please try again.",
          icon: (
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          ),
          bgColor: "bg-red-50",
          borderColor: "border-red-400",
          textColor: "text-red-800",
        };
      case "user_exited":
      case "cancelled":
        return {
          title: "Transaction Cancelled",
          message:
            "You cancelled the transaction. No funds were transferred.",
          icon: (
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          ),
          bgColor: "bg-gray-50",
          borderColor: "border-gray-400",
          textColor: "text-gray-800",
        };
      default:
        return {
          title: "Transaction Not Completed",
          message: `Your cash-out request could not be processed. ${!status ? 'Common reasons include:\n\n🔑 No Coinbase Account: You MUST have a Coinbase account with linked bank details. Guest checkout is not supported for offramp.\n\n• Insufficient Balance: Your wallet may not have enough crypto\n• Payment Method Not Linked: Bank account/PayPal not connected in Coinbase\n• Identity Not Verified: Coinbase account needs verification\n• Wrong Network: Asset may be on a different network\n• Transaction Cancelled: You closed the Coinbase window\n\nPlease verify your Coinbase account setup and wallet balance, then try again. ' : `Status: ${status}. `}For assistance, check the browser console (F12) or contact support.`,
          icon: (
            <svg
              className="w-6 h-6 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          ),
          bgColor: "bg-orange-50",
          borderColor: "border-orange-400",
          textColor: "text-orange-800",
        };
    }
  };

  const content = getNotificationContent();

  if (!visible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
        content.bgColor
      } ${content.borderColor} max-w-md transition-all duration-300 transform ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{content.icon}</div>
        <div className="ml-3 w-0 flex-1">
          <p className={`text-sm font-medium ${content.textColor}`}>
            {content.title}
          </p>
          <p className={`mt-1 text-sm ${content.textColor} whitespace-pre-line`}>
            {content.message}
          </p>
          <div className="mt-4 flex">
            <button
              onClick={() => {
                setVisible(false);
                onClose();
              }}
              className={`${content.textColor} text-sm font-medium underline hover:text-opacity-75`}
            >
              Dismiss
            </button>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => {
              setVisible(false);
              onClose();
            }}
            className="inline-flex text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
