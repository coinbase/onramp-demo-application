"use client";

import { Button } from "@coinbase/cds-web/buttons";
import { Box, VStack } from "@coinbase/cds-web/layout";
import { Text } from "@coinbase/cds-web/typography";
import { ReactNode } from "react";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  docsHref?: string;
  docsLabel?: string;
  children?: ReactNode;
}

export function PageHero({
  eyebrow,
  title,
  description,
  docsHref,
  docsLabel = "View Documentation",
  children,
}: PageHeroProps) {
  return (
    <Box
      as="section"
      className="cds-app-shell cds-page-hero relative overflow-hidden pt-24"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="cds-float absolute top-20 right-10 w-[500px] h-[500px] bg-cds-primary rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>
      </div>

      <div className="cds-container py-16 relative z-10">
        <VStack
          gap={3}
          alignItems="center"
          className="cds-animate-in max-w-4xl mx-auto text-center"
        >
          <div className="cds-pill px-4 py-2">
            <span className="cds-status-dot"></span>
            <Text as="span" font="label1" className="whitespace-nowrap">
              {eyebrow}
            </Text>
          </div>

          <Text
            as="h1"
            font="display2"
            className="cds-heading-gradient tracking-tight"
          >
            {title}
          </Text>

          <Text
            as="p"
            font="title4"
            color="fgMuted"
            className="max-w-3xl mx-auto leading-relaxed"
          >
            {description}
          </Text>

          {children}

          {docsHref && (
            <Button
              as="a"
              href={docsHref}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              endIcon="arrowRight"
            >
              {docsLabel}
            </Button>
          )}
        </VStack>
      </div>
    </Box>
  );
}

export default PageHero;
