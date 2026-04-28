import "@coinbase/onchainkit/styles.css";
import "@coinbase/cds-icons/fonts/web/icon-font.css";
import "@coinbase/cds-web/defaultFontStyles";
import "@coinbase/cds-web/globalStyles";
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Coinbase Onramp & Offramp Demo",
  description:
    "A demo application showcasing Coinbase Onramp and Offramp integration",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light cds-default">
      <body className="bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
