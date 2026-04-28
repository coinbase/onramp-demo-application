"use client";

import React, { useEffect, Suspense } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import OfframpFeature from "../components/OfframpFeature";
import { useRouter, useSearchParams } from "next/navigation";
import PageHero from "../components/PageHero";

// Create a client component that uses useSearchParams
function OfframpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  useEffect(() => {
    // If we have a status parameter, it means we're returning from Coinbase
    if (status) {
      console.log("Returned from Coinbase with status:", status);

      // Keep the status in the URL so OfframpFeature can show the modal.
    }
  }, [status, router]);

  return (
    <main className="flex-grow">
      <PageHero
        eyebrow="Powered by Coinbase Developer Platform"
        title="Offramp"
        description="Allow your users to convert their crypto to fiat directly within your application with just a few lines of code."
        docsHref="https://docs.cdp.coinbase.com/onramp/docs/welcome"
      />

      {/* Main content */}
      <OfframpFeature />
    </main>
  );
}

// Loading fallback component
function OfframpLoading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div
        className="cds-spinner"
        role="status"
        aria-label="Loading offramp"
      ></div>
    </div>
  );
}

export default function OfframpPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Suspense fallback={<OfframpLoading />}>
        <OfframpContent />
      </Suspense>
      <Footer />
    </div>
  );
}
