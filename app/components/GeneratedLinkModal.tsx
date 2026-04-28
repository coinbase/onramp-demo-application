"use client";

import { Button } from "@coinbase/cds-web/buttons";
import { Box, VStack } from "@coinbase/cds-web/layout";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@coinbase/cds-web/overlays";
import { Text } from "@coinbase/cds-web/typography";
import React, { memo } from "react";

interface GeneratedLinkModalProps {
  title: string;
  url: string;
  onClose: () => void;
  onCopy: () => void;
  onOpen: () => void;
}

// Memoize the component to prevent unnecessary re-renders
const GeneratedLinkModal = memo(function GeneratedLinkModal({
  title,
  url,
  onClose,
  onCopy,
  onOpen,
}: GeneratedLinkModalProps) {
  // Truncate extremely long URLs to prevent rendering issues
  const displayUrl = url.length > 500 ? url.substring(0, 500) + "..." : url;

  return (
    <Modal visible onRequestClose={onClose}>
      <ModalHeader closeAccessibilityLabel="Close" title={title} />
      <ModalBody tabIndex={0}>
        <VStack gap={2}>
          <Text as="p" font="body">
            URL to redirect users to Coinbase:
          </Text>
          <Box
            background="bgAlternate"
            bordered
            borderRadius={300}
            padding={2}
            overflow="auto"
            maxHeight={120}
          >
            <Text as="div" mono font="caption" overflow="break">
              {displayUrl}
            </Text>
          </Box>
        </VStack>
      </ModalBody>
      <ModalFooter
        secondaryAction={
          <Button onClick={onCopy} variant="secondary">
            Copy URL
          </Button>
        }
        primaryAction={<Button onClick={onOpen}>Open URL</Button>}
      />
    </Modal>
  );
});

export default GeneratedLinkModal;
