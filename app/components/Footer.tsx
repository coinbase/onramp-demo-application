"use client";

import { Text } from "@coinbase/cds-web/typography";

export function Footer() {
  return (
    <footer className="bg-cds-fg text-cds-bg">
      <div className="cds-container py-6">
        <div className="text-center">
          <a
            href="https://www.coinbase.com/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-80 hover:opacity-100 transition-opacity font-medium"
          >
            <Text as="span" font="label1" color="fgInverse">
              Privacy Policy
            </Text>
          </a>
        </div>
      </div>
    </footer>
  );
}

// For backward compatibility
export default Footer;
