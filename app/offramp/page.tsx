"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import OfframpFeature from "../components/OfframpFeature";
import { useRouter, useSearchParams } from "next/navigation";

// Create a client component that uses useSearchParams
function OfframpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  useEffect(() => {
    // If we have a status parameter, it means we're returning from Coinbase
    if (status) {
      console.log("Returned from Coinbase with status:", status);

      // We'll keep the status in the URL so the OfframpFeature component can show the appropriate modal
    }
  }, [status, router]);

  return (
    <main className="flex-grow">
      {/* Modern hero section with gradient background */}
      <section className="relative overflow-hidden">
        {/* Modern gradient background */}
        <div className="absolute inset-0 bg-[#fafafa] z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-50 opacity-80"></div>

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNmMWYxZjEiIGQ9Ik0zNiAxOGgtMnYyaDJ6TTQwIDE4aC0ydjJoMnpNNDQgMThoLTJ2Mmgyek0zNCAxNmgtMnYyaDJ6TTM4IDE2aC0ydjJoMnpNNDIgMTZoLTJ2Mmgyek0zMCAxNmgtMnYyaDJ6TTI2IDE2aC0ydjJoMnpNMjIgMTZoLTJ2Mmgyek0xOCAxNmgtMnYyaDJ6TDE0IDE2aC0ydjJoMnpNMTAgMTZIOHYyaDJ6TTYgMTZINHYyaDJ6Ii8+PC9nPjwvc3ZnPg==')] opacity-[0.15]"></div>
        </div>

        {/* Subtle gradient orb */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-float"></div>
        </div>

        <div className="container mx-auto px-4 pt-28 pb-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 border border-purple-200 mb-6">
              <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
              <span className="text-purple-700 text-sm font-medium whitespace-nowrap">
                Powered by Coinbase Developer Platform
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 tracking-tight">
              Offramp
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Allow your users to convert their crypto to fiat directly within
              your application with just a few lines of code.
            </p>

            <Link
              href="https://docs.cdp.coinbase.com/onramp/docs/welcome"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium mb-10"
            >
              View Documentation <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main content */}
      <OfframpFeature />
    </main>
  );
}

// Loading fallback component
function OfframpLoading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
