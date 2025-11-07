"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { EmbeddedWalletAuth } from "./EmbeddedWalletAuth";

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md py-3"
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm py-4 shadow-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="h-10 mr-3">
              <Image
                src="/coinbase-logo.png"
                alt="Coinbase Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              Coinbase Onramp & Offramp
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavLink
              href="/"
              isActive={pathname === "/"}
              isScrolled={isScrolled}
            >
              Home
            </NavLink>
            <NavLink
              href="/onramp"
              isActive={pathname === "/onramp"}
              isScrolled={isScrolled}
            >
              Onramp
            </NavLink>
            <NavLink
              href="/offramp"
              isActive={pathname === "/offramp"}
              isScrolled={isScrolled}
            >
              Offramp
            </NavLink>
            <NavLink
              href="/apple-pay"
              isActive={pathname === "/apple-pay"}
              isScrolled={isScrolled}
            >
              Apple Pay
            </NavLink>
            <NavLink
              href="/fund"
              isActive={pathname === "/fund"}
              isScrolled={isScrolled}
            >
              Fund
            </NavLink>
            <NavLink
              href="/compare"
              isActive={pathname === "/compare"}
              isScrolled={isScrolled}
            >
              Compare
            </NavLink>

            <div className="ml-4">
              <EmbeddedWalletAuth />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg rounded-b-lg mt-2 py-4 px-4 absolute left-4 right-4">
          <nav className="flex flex-col space-y-3">
            <MobileNavLink
              href="/"
              isActive={pathname === "/"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </MobileNavLink>
            <MobileNavLink
              href="/onramp"
              isActive={pathname === "/onramp"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Onramp
            </MobileNavLink>
            <MobileNavLink
              href="/offramp"
              isActive={pathname === "/offramp"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Offramp
            </MobileNavLink>
            <MobileNavLink
              href="/apple-pay"
              isActive={pathname === "/apple-pay"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Apple Pay
            </MobileNavLink>
            <MobileNavLink
              href="/fund"
              isActive={pathname === "/fund"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Fund
            </MobileNavLink>
            <MobileNavLink
              href="/compare"
              isActive={pathname === "/compare"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Compare
            </MobileNavLink>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <EmbeddedWalletAuth />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  children,
  isActive,
  isScrolled,
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  isScrolled: boolean;
}) {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors";

  const activeClasses =
    "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm";

  const inactiveClasses =
    "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:text-blue-600 dark:hover:text-blue-300";

  return (
    <Link
      href={href}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  isActive,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg font-medium ${
        isActive
          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
          : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/70"
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

// For backward compatibility
export default Header;
