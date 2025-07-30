"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  // Ensure animations only run on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-[#fafafa] dark:bg-[#111] z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0f0f0] via-white to-[#f8f8f8] dark:from-[#111] dark:via-[#131313] dark:to-[#0a0a0a] opacity-80"></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNmMWYxZjEiIGQ9Ik0zNiAxOGgtMnYyaDJ6TTQwIDE4aC0ydjJoMnpNNDQgMThoLTJ2Mmgyek0zNCAxNmgtMnYyaDJ6TTM4IDE2aC0ydjJoMnpNNDIgMTZoLTJ2Mmgyek0zMCAxNmgtMnYyaDJ6TTI2IDE2aC0ydjJoMnpNMjIgMTZoLTJ2Mmgyek0xOCAxNmgtMnYyaDJ6TTE0IDE2aC0ydjJoMnpNMTAgMTZIOHYyaDJ6TTYgMTZINHYyaDJ6Ii8+PC9nPjwvc3ZnPg==')] opacity-[0.15] dark:opacity-[0.05]"></div>
      </div>

      {/* Subtle gradient orbs */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-float"></div>
          <div className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-float animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-green-400 dark:bg-green-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-float animation-delay-4000"></div>
        </div>
      )}

      <div className="container mx-auto px-4 py-16 md:py-32 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                Powered by Coinbase Developer Platform
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 dark:from-blue-400 dark:via-purple-400 dark:to-green-400 tracking-tight">
              Coinbase Onramp & Offramp
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              The seamless bridge between fiat and crypto for your applications
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    Onramp
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Convert fiat to crypto and bring users onchain with Coinbase
                    Onramp.
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    href="/onramp"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium inline-flex items-center border border-blue-300 dark:border-blue-600 rounded-lg px-4 py-2 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    Explore Onramp <span className="ml-2">→</span>
                  </Link>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    Offramp
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Convert crypto back to fiat with Coinbase Offramp - the
                    easiest way to cash out.
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    href="/offramp"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium inline-flex items-center border border-blue-300 dark:border-blue-600 rounded-lg px-4 py-2 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    Explore Offramp <span className="ml-2">→</span>
                  </Link>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    Fund
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Enable users to fund your project with crypto using
                    Coinbase's Fund Button and Fund Card components.
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    href="/fund"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium inline-flex items-center border border-blue-300 dark:border-blue-600 rounded-lg px-4 py-2 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    Explore Fund <span className="ml-2">→</span>
                  </Link>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    Compare
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    See how our features work together and choose the right
                    solution for your needs.
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    href="/compare"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium inline-flex items-center border border-blue-300 dark:border-blue-600 rounded-lg px-4 py-2 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    Explore Compare <span className="ml-2">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(20px, -30px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 7s;
        }
        .animation-delay-4000 {
          animation-delay: 14s;
        }
      `}</style>
    </section>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 transition-all hover:shadow-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800">
      <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg inline-block mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
