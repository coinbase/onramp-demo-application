"use client";

import React from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import ApplePayFeature from "../components/ApplePayFeature";
import PageHero from "../components/PageHero";

export default function ApplePayPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <PageHero
          eyebrow="Apple Pay Integration • US Only • Fastest Onramp"
          title="Apple Pay Onramp"
          description="The fastest onramp experience available. Complete your purchase without leaving your app using Apple Pay."
          docsHref="https://docs.cdp.coinbase.com/onramp-&-offramp/onramp-apis/apple-pay-onramp-api"
        />

        <ApplePayFeature />
      </main>
      <Footer />
    </div>
  );
}

