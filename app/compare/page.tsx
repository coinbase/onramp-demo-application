"use client";

import React, { useState } from "react";
import { Button } from "@coinbase/cds-web/buttons";
import { Box, VStack } from "@coinbase/cds-web/layout";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableRow,
} from "@coinbase/cds-web/tables";
import { Text } from "@coinbase/cds-web/typography";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import PageHero from "../components/PageHero";

const comparisonRows = [
  {
    feature: "Primary Use Case",
    onramp: "Convert fiat to crypto",
    offramp: "Convert crypto to fiat",
    fund: "Fund dApps and projects with crypto",
    applePay: "Native Apple Pay onramp inside your app",
  },
  {
    feature: "Integration Complexity",
    onramp: "Low",
    offramp: "Low",
    fund: "Very Low",
    applePay: "Medium",
  },
  {
    feature: "User Experience",
    onramp: "Embedded in your app",
    offramp: "Embedded in your app",
    fund: "Button or card in your app",
    applePay: "Fastest native in-app flow",
  },
  {
    feature: "Payment Methods",
    onramp: "Credit/debit cards, bank transfers",
    offramp: "Coinbase account-linked cashout methods",
    fund: "Coinbase Onramp payment methods",
    applePay: "Apple Pay / card-backed guest checkout",
  },
  {
    feature: "Supported Assets",
    onramp: "25+ cryptocurrencies",
    offramp: "25+ cryptocurrencies",
    fund: "ETH, USDC, MATIC, AVAX, ARB, OP",
    applePay: "Assets returned by Buy Options API",
  },
  {
    feature: "Geographic Availability",
    onramp: "100+ countries",
    offramp: "30+ countries",
    fund: "Global",
    applePay: "US users only",
  },
  {
    feature: "KYC Requirements",
    onramp: "Handled by Coinbase when required",
    offramp: "Coinbase account required",
    fund: "Handled by Coinbase Onramp",
    applePay: "Email and phone verification required",
  },
  {
    feature: "Wallet Connection",
    onramp: "Optional",
    offramp: "Required",
    fund: "Required in this demo",
    applePay: "Destination wallet address required",
  },
  {
    feature: "Extra Setup",
    onramp: "Session token and redirect domain setup",
    offramp: "Session token and Coinbase account cashout setup",
    fund: "OnchainKit provider and project config",
    applePay: "Domain allowlist, verification file, iframe event handling",
  },
];

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
        <PageHero
          eyebrow="Powered by Coinbase Developer Platform"
          title="Compare Onramp, Offramp, Fund & Apple Pay"
          description="Choose the right solution for your application by comparing Coinbase Onramp, Offramp, Fund, and Headless Apple Pay Onramp."
          docsHref="https://docs.cdp.coinbase.com/onramp/docs/welcome"
        />

        {/* Feature Comparison Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <Box overflow="auto">
                <Table
                  bordered
                  variant="ruled"
                  accessibilityLabel="Feature comparison table"
                >
                  <TableCaption>
                    Compare Onramp, Offramp, Fund, and Apple Pay features
                  </TableCaption>
                  <TableHeader>
                    <TableRow backgroundColor="bgAlternate">
                      <TableCell title="Feature" />
                      <TableCell title="Onramp" />
                      <TableCell title="Offramp" />
                      <TableCell title="Fund" />
                      <TableCell title="Apple Pay Headless" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonRows.map((row) => (
                      <TableRow key={row.feature}>
                        <TableCell title={row.feature} titleColor="fg" />
                        <TableCell title={row.onramp} />
                        <TableCell title={row.offramp} />
                        <TableCell title={row.fund} />
                        <TableCell title={row.applePay} />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Text as="h2" font="title1" textAlign="center" className="mb-10">
                Frequently Asked Questions
              </Text>

              <div className="space-y-4">
                <FaqItem
                  question="What's the difference between Onramp, Offramp, Fund, and Apple Pay Headless?"
                  answer="Onramp sends users to a Coinbase-hosted buy flow, Offramp lets eligible users sell crypto for fiat, Fund gives you OnchainKit components for funding wallets or dApps, and Apple Pay Headless uses the Onramp Order API plus an iframe/webview payment link for a native Apple Pay-style experience inside your app."
                  isOpen={openFaq === 0}
                  onClick={() => toggleFaq(0)}
                />

                <FaqItem
                  question="Do I need to implement every solution?"
                  answer="No. You can implement any combination based on your product needs. Most teams start with Coinbase-hosted Onramp or Fund for quick integration, then add Offramp or Headless Apple Pay when they need sell flows or a more native in-app payment experience."
                  isOpen={openFaq === 1}
                  onClick={() => toggleFaq(1)}
                />

                <FaqItem
                  question="What are the integration requirements?"
                  answer="Onramp and Offramp require a Coinbase Developer Platform project, API credentials, session-token generation, and redirect/domain configuration. Fund requires OnchainKit and project configuration. Apple Pay Headless additionally requires the Create Onramp Order API, verified email and phone collection, a valid US phone number, iframe or webview event handling, and web domain setup for production."
                  isOpen={openFaq === 2}
                  onClick={() => toggleFaq(2)}
                />

                <FaqItem
                  question="Do users need a Coinbase account?"
                  answer="For Coinbase-hosted Onramp, Coinbase users can sign in, and supported users can also use Guest Checkout with debit card, Apple Pay, or Google Pay without a Coinbase account. For Offramp and ACH fiat withdrawals, a Coinbase account with linked bank details is required; guest checkout is not supported. Fund uses Coinbase Onramp, so requirements depend on the payment method and region. Apple Pay Headless is a guest-checkout style flow for US users with verified email and valid US phone numbers."
                  isOpen={openFaq === 3}
                  onClick={() => toggleFaq(3)}
                />
              </div>

              <div className="mt-12 text-center">
                <Button
                  as="a"
                  href="https://docs.cdp.coinbase.com/onramp/docs/welcome"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  endIcon="arrowRight"
                >
                  Explore Onramp/Offramp Documentation
                </Button>
                <div className="mt-4">
                  <Button
                    as="a"
                    href="https://docs.base.org/builderkits/onchainkit"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                    endIcon="arrowRight"
                  >
                    Explore OnchainKit Documentation
                  </Button>
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
    <VStack bordered borderRadius={300} overflow="hidden">
      <button
        className="flex justify-between items-center w-full px-6 py-4 text-left bg-white hover:bg-gray-50 focus:outline-none"
        onClick={onClick}
      >
        <Text as="span" font="headline">
          {question}
        </Text>
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
          <Text as="p" color="fgMuted">
            {answer}
          </Text>
        </div>
      )}
    </VStack>
  );
}
