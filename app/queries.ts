import { SiweMessage } from 'siwe';
import {
  AggregatorInputParams,
  SellOptionsRequest,
  SellOptionsResponse,
  SellQuoteRequest,
  SellQuoteResponse,
} from './types';

export async function generateSecureToken({
  ethAddress,
  blockchains,
}: {
  ethAddress: string;
  aggregatorInputs?: AggregatorInputParams;
  showBuyQuoteURLText?: boolean;
  blockchains?: string[];
  partnerUserId?: string;
}): Promise<string> {
  try {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addresses: [{
          address: ethAddress,
          blockchains: blockchains?.length ? blockchains : ['base'],
        }],
      }),
    });
    if (!response.ok) {
      console.log(await response.text());
      throw new Error(
        'Failed to fetch secure token: ensure valid inputs, crypto wallet matches network, and secure connection'
      );
    }
    const json = await response.json();
    return json.token;
  } catch (error) {
    throw error;
  }
}

export async function generateSellConfig() {
  try {
    const response = await fetch('/api/sell-config', {
      method: 'GET',
    });
    if (!response.ok) {
      console.log(await response.text());
      throw new Error('Failed to fetch sell config');
    }
    const json = await response.json();
    return json;
  } catch (error) {
    throw error;
  }
}

export async function generateSellOptions({
  country,
  subdivision,
}: SellOptionsRequest) {
  try {
    const params = new URLSearchParams({ country });
    if (subdivision) {
      params.append('subdivision', subdivision);
    }

    const response = await fetch(`/api/sell-options?${params.toString()}`);

    if (!response.ok) {
      console.log(await response.status);
      throw new Error('Failed to fetch sell options');
    }

    const json: SellOptionsResponse = await response.json();
    return json;
  } catch (error) {
    throw error;
  }
}

export async function generateSellQuote(request: SellQuoteRequest) {
  try {
    const response = await fetch('/api/sell-quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const jsonText = await response.text();
      console.log(jsonText);
      throw new Error(jsonText);
    }

    const json: SellQuoteResponse = await response.json();
    return json;
  } catch (error) {
    throw error;
  }
}

export async function setSession({
  message,
  signature,
}: {
  message: SiweMessage;
  signature: `0x${string}`;
}) {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message.prepareMessage(), signature }),
    });

    if (!response.ok) {
      console.log(await response.text());
      throw new Error('Failed to set session');
    }

    const json = await response.json();
    return json;
  } catch (error) {
    throw error;
  }
}

export async function getOrdersByPartnerUserId({
  partnerUserId,
  pageKey,
  pageSize,
}: {
  partnerUserId: string;
  pageKey?: string;
  pageSize?: number;
}) {
  try {
    let url = `/api/transaction-history/${partnerUserId}`;

    if (pageKey && pageSize) {
      url += `?page_key=${pageKey}&page_size=${pageSize}`;
    } else if (pageKey) {
      url += `?page_key=${pageKey}`;
    } else if (pageSize) {
      url += `?page_size=${pageSize}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      console.log(await response.text());
      throw new Error('Failed to fetch orders by partner user id');
    }

    const json = await response.json();
    return json;
  } catch (error) {
    throw error;
  }
}
