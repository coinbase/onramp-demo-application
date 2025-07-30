"use client";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <a
            href="https://www.coinbase.com/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white transition-colors font-medium"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}

// For backward compatibility
export default Footer;
