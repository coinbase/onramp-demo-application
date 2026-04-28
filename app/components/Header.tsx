"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Text } from "@coinbase/cds-web/typography";
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
      className={`cds-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "backdrop-blur-md py-3"
          : "backdrop-blur-sm py-4"
      }`}
    >
      <div className="cds-container">
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
            <Text as="span" font="title4" className="text-cds-fg">
              Coinbase Onramp & Offramp
            </Text>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavLink
              href="/"
              isActive={pathname === "/"}
            >
              Home
            </NavLink>
            <NavLink
              href="/onramp"
              isActive={pathname === "/onramp"}
            >
              Onramp
            </NavLink>
            <NavLink
              href="/offramp"
              isActive={pathname === "/offramp"}
            >
              Offramp
            </NavLink>
            <NavLink
              href="/apple-pay"
              isActive={pathname === "/apple-pay"}
            >
              Apple Pay
            </NavLink>
            <NavLink
              href="/fund"
              isActive={pathname === "/fund"}
            >
              Fund
            </NavLink>
            <NavLink
              href="/compare"
              isActive={pathname === "/compare"}
            >
              Compare
            </NavLink>

            <div className="ml-4">
              <EmbeddedWalletAuth />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-cds-muted hover:text-cds-fg focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="cds-icon h-6 w-6"
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
                className="cds-icon h-6 w-6"
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
        <div className="cds-surface md:hidden mt-2 py-4 px-4 absolute left-4 right-4">
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

            <div className="pt-3 border-t border-cds-line">
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
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}) {
  const baseClasses = "cds-nav-link px-4 py-2 font-medium transition-colors";
  const activeClasses = "cds-nav-link-active";

  return (
    <Link
      href={href}
      className={`${baseClasses} ${isActive ? activeClasses : ""}`}
    >
      <Text as="span" font="label1">
        {children}
      </Text>
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
      className={`cds-nav-link px-4 py-2 font-medium ${
        isActive ? "cds-nav-link-active" : ""
      }`}
      onClick={onClick}
    >
      <Text as="span" font="label1">
        {children}
      </Text>
    </Link>
  );
}

// For backward compatibility
export default Header;
