"use client";

import { Button } from "@coinbase/cds-web/buttons";
import { ContentCard, ContentCardBody } from "@coinbase/cds-web/cards";
import { Pictogram } from "@coinbase/cds-web/illustrations";
import type { PictogramName } from "@coinbase/cds-web/illustrations";
import { Box, HStack, VStack } from "@coinbase/cds-web/layout";
import { Text } from "@coinbase/cds-web/typography";
import { useState, useEffect } from "react";

const features: Array<{
  title: string;
  description: string;
  href: string;
  label: string;
  pictogram: PictogramName;
  badge?: string;
  external?: boolean;
}> = [
  {
    title: "Onramp",
    description: "Convert fiat to crypto and bring users onchain with Coinbase Onramp.",
    href: "/onramp",
    label: "Explore Onramp",
    pictogram: "addPayment",
  },
  {
    title: "Offramp",
    description: "Convert crypto back to fiat with Coinbase Offramp.",
    href: "/offramp",
    label: "Explore Offramp",
    pictogram: "sellSendAnytime",
  },
  {
    title: "Apple Pay",
    description: "Complete purchases without leaving your app using Apple Pay.",
    href: "/apple-pay",
    label: "Try Apple Pay",
    badge: "NEW",
    pictogram: "creditCard",
  },
  {
    title: "Fund",
    description: "Enable crypto funding with Coinbase Fund Button and Fund Card.",
    href: "/fund",
    label: "Explore Fund",
    pictogram: "walletDeposit",
  },
  {
    title: "Compare",
    description: "Choose the right solution for your product and user flow.",
    href: "/compare",
    label: "Explore Compare",
    pictogram: "pieChartWithArrow",
  },
  {
    title: "Embedded Wallets",
    description: "Create wallets with email sign-in and skip seed phrases.",
    href: "https://docs.cdp.coinbase.com/embedded-wallets/welcome",
    label: "Learn More",
    badge: "FEATURED",
    external: true,
    pictogram: "walletAsServiceNavigation",
  },
];

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  // Ensure animations only run on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Box as="section" className="cds-app-shell relative overflow-hidden pt-24">
      {mounted && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="cds-float absolute top-20 left-10 w-[500px] h-[500px] bg-cds-primary rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>
          <div className="cds-float animation-delay-2000 absolute bottom-20 right-10 w-[600px] h-[600px] bg-cds-positive rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>
        </div>
      )}

      <div className="cds-container py-16 md:py-28 relative z-10">
        <div className="max-w-5xl mx-auto">
          <VStack
            gap={4}
            alignItems="center"
            className="cds-animate-in text-center mb-16"
          >
            <HStack gap={1} alignItems="center" className="cds-pill px-3 py-1">
              <span className="cds-status-dot"></span>
              <Text as="span" font="label1">
                Powered by Coinbase Developer Platform
              </Text>
            </HStack>

            <Text
              as="h1"
              font="display1"
              className="cds-heading-gradient tracking-tight"
            >
              Coinbase Onramp & Offramp
            </Text>

            <Text
              as="p"
              font="title4"
              color="fgMuted"
              className="max-w-3xl mx-auto leading-relaxed"
            >
              The seamless bridge between fiat and crypto for your applications
            </Text>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 w-full">
              {features.map((feature) => (
                <ContentCard
                  key={feature.title}
                  className="cds-card p-6 flex flex-col h-full text-left"
                >
                  <ContentCardBody
                    title={
                      <VStack gap={1}>
                        <Box className="mb-3">
                          <Pictogram
                            name={feature.pictogram}
                            dimension="48x48"
                            alt=""
                          />
                        </Box>
                        {feature.badge && (
                          <Text
                            as="span"
                            font="caption"
                            className="cds-pill px-2 py-1 w-fit"
                          >
                            {feature.badge}
                          </Text>
                        )}
                        <Text as="h3" font="title3">
                          {feature.title}
                        </Text>
                      </VStack>
                    }
                    description={
                      <Text as="p" color="fgMuted">
                        {feature.description}
                      </Text>
                    }
                  >
                    <Box className="mt-6">
                      <Button
                        as="a"
                        href={feature.href}
                        target={feature.external ? "_blank" : undefined}
                        rel={feature.external ? "noopener noreferrer" : undefined}
                        variant="secondary"
                        endIcon="arrowRight"
                      >
                        {feature.label}
                      </Button>
                    </Box>
                  </ContentCardBody>
                </ContentCard>
              ))}
            </div>
          </VStack>
        </div>
      </div>

    </Box>
  );
}
