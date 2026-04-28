"use client";

import React from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import OnrampFeature from "../components/OnrampFeature";
import PageHero from "../components/PageHero";

export default function OnrampPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <PageHero
          eyebrow="Powered by Coinbase Developer Platform"
          title="Onramp"
          description="Enable your users to purchase crypto directly within your application with just a few lines of code."
          docsHref="https://docs.cdp.coinbase.com/onramp/docs/welcome"
        />

        {/* Main content */}
        <OnrampFeature />
      </main>
      <Footer />
    </div>
  );
}
