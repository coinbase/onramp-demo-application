"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export default function ComparePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Modern hero section with gradient background */}
        <section className="relative overflow-hidden">
          {/* Modern gradient background */}
          <div className="absolute inset-0 bg-[#fafafa] z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 opacity-80"></div>

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNmMWYxZjEiIGQ9Ik0zNiAxOGgtMnYyaDJ6TTQwIDE4aC0ydjJoMnpNNDQgMThoLTJ2Mmgyek0zNCAxNmgtMnYyaDJ6TTM4IDE2aC0ydjJoMnpNNDIgMTZoLTJ2Mmgyek0zMCAxNmgtMnYyaDJ6TTI2IDE2aC0ydjJoMnpNMjIgMTZoLTJ2Mmgyek0xOCAxNmgtMnYyaDJ6TDE0IDE2aC0ydjJoMnpNMTAgMTZIOHYyaDJ6TTYgMTZINHYyaDJ6Ii8+PC9nPjwvc3ZnPg==')] opacity-[0.15]"></div>
          </div>

          {/* Subtle gradient orb */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-indigo-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-float"></div>
          </div>

          <div className="container mx-auto px-4 pt-28 pb-16 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 mb-6">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                <span className="text-indigo-700 text-sm font-medium whitespace-nowrap">
                  Powered by Coinbase Developer Platform
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 tracking-tight">
                Compare Onramp, Offramp & Fund
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Choose the right solution for your application by comparing
                features and capabilities of Coinbase's Onramp, Offramp, and
                Fund products.
              </p>

              <Link
                href="https://docs.cdp.coinbase.com/onramp/docs/welcome"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-10"
              >
                View Documentation <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Comparison Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <thead>
                    <tr className="bg-gray-200 border-b border-gray-300">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Feature
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600 uppercase tracking-wider">
                        Onramp
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-purple-600 uppercase tracking-wider">
                        Offramp
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-amber-600 uppercase tracking-wider">
                        Fund
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <FeatureRowWithFund
                      feature="Primary Use Case"
                      onramp="Convert fiat to crypto"
                      offramp="Convert crypto to fiat"
                      fund="Fund dApps and projects with crypto"
                    />
                    <FeatureRowWithFund
                      feature="Integration Complexity"
                      onramp="Low"
                      offramp="Low"
                      fund="Very Low"
                    />
                    <FeatureRowWithFund
                      feature="User Experience"
                      onramp="Embedded in your app"
                      offramp="Embedded in your app"
                      fund="Button or card in your app"
                    />
                    <FeatureRowWithFund
                      feature="Payment Methods"
                      onramp="Credit/debit cards, bank transfers"
                      offramp="Bank transfers"
                      fund="Crypto wallets"
                    />
                    <FeatureRowWithFund
                      feature="Supported Assets"
                      onramp="25+ cryptocurrencies"
                      offramp="25+ cryptocurrencies"
                      fund="ETH, USDC, MATIC, AVAX, ARB, OP"
                    />
                    <FeatureRowWithFund
                      feature="Geographic Availability"
                      onramp="100+ countries"
                      offramp="30+ countries"
                      fund="Global"
                    />
                    <FeatureRowWithFund
                      feature="KYC Requirements"
                      onramp="Yes"
                      offramp="Yes"
                      fund="No"
                    />
                    <FeatureRowWithFund
                      feature="Wallet Connection"
                      onramp="Optional"
                      offramp="Required"
                      fund="Required"
                      isLastRow={true}
                    />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center">
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                <FaqItem
                  question="What's the difference between Onramp, Offramp, and Fund?"
                  answer="Onramp allows users to convert fiat currency to cryptocurrency, Offramp enables users to convert cryptocurrency back to fiat, and Fund provides a simple way for users to fund dApps and projects with cryptocurrency directly from their wallet."
                  isOpen={openFaq === 0}
                  onClick={() => toggleFaq(0)}
                />

                <FaqItem
                  question="Do I need to implement all three solutions?"
                  answer="No, you can implement any combination of Onramp, Offramp, and Fund based on your application's needs. Each solution serves a different purpose and can be integrated independently."
                  isOpen={openFaq === 1}
                  onClick={() => toggleFaq(1)}
                />

                <FaqItem
                  question="What are the integration requirements?"
                  answer="Onramp and Offramp require a Coinbase Developer Platform account and API keys. Fund integration is even simpler, requiring just a few lines of code using OnchainKit. All solutions offer SDKs and detailed documentation to make integration straightforward."
                  isOpen={openFaq === 2}
                  onClick={() => toggleFaq(2)}
                />

                <FaqItem
                  question="Do users need a Coinbase account?"
                  answer="For Onramp and Offramp, users don't need a pre-existing Coinbase account, but they will need to complete KYC verification during the process. For Fund, users only need a connected crypto wallet."
                  isOpen={openFaq === 3}
                  onClick={() => toggleFaq(3)}
                />
              </div>

              <div className="mt-12 text-center">
                <Link
                  href="https://docs.cdp.coinbase.com/onramp/docs/welcome"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Explore Onramp/Offramp Documentation{" "}
                  <span className="ml-2">→</span>
                </Link>
                <div className="mt-4">
                  <Link
                    href="https://docs.base.org/builderkits/onchainkit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Explore OnchainKit Documentation{" "}
                    <span className="ml-2">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function FaqItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="flex justify-between items-center w-full px-6 py-4 text-left bg-white hover:bg-gray-50 focus:outline-none"
        onClick={onClick}
      >
        <span className="font-medium text-gray-900">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-white border-t border-gray-200">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
}

function FeatureRowWithFund({
  feature,
  onramp,
  offramp,
  fund,
  isLastRow = false,
}: {
  feature: string;
  onramp: string;
  offramp: string;
  fund: string;
  isLastRow?: boolean;
}) {
  return (
    <tr className={`hover:bg-gray-50 ${isLastRow ? "border-b-0" : ""}`}>
      <td
        className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 bg-gray-50 border-r border-gray-200 ${
          isLastRow ? "rounded-bl-xl" : ""
        }`}
      >
        {feature}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
        {onramp}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
        {offramp}
      </td>
      <td
        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center ${
          isLastRow ? "rounded-br-xl" : ""
        }`}
      >
        {fund}
      </td>
    </tr>
  );
}
