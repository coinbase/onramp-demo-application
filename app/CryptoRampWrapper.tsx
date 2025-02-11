'use client';

import { Divider } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { useCoinbaseRampTransaction } from './contexts/CoinbaseRampTransactionContext';

import { fetchOnrampConfig } from '@coinbase/onchainkit/fund';
import { FundButtonDemo } from './components/FundButtonDemo';
import { FundCardDemo } from './components/FundCardDemo';

interface ICryptoRampProps {
  partnerUserId?: string;
}

export function CryptoRampWrapper({ partnerUserId }: ICryptoRampProps) {
  const [step, setStep] = useState(1);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const {
    mode,
    setMode,
    setBuyConfig,
    authenticated,
    setPartnerUserId,
    setLoadingBuyConfig,
  } = useCoinbaseRampTransaction();

  const [currency, setCurrency] = useState('USD');
  const [asset, setAsset] = useState('BTC');
  useEffect(() => {
    if (partnerUserId) {
      setPartnerUserId(partnerUserId);
    } else {
      // Check if partnerUserId exists in localStorage
      const storedPartnerId = localStorage.getItem('cb_ramp_user_id');
      if (storedPartnerId) {
        setPartnerUserId(storedPartnerId);
      } else {
        // Generate a new UUID and store it in localStorage
        const newPartnerId = crypto.randomUUID();
        localStorage.setItem('cb_ramp_user_id', newPartnerId);
        setPartnerUserId(newPartnerId);
      }
      setPartnerUserId(crypto.randomUUID());
    }
  }, [partnerUserId, setPartnerUserId]);

  useEffect(() => {
    const getBuyconfig = async () => {
      try {
        setLoadingBuyConfig(true);
        const config = await fetchOnrampConfig();
        setBuyConfig(config);
        setLoadingBuyConfig(false);
      } catch (error) {
        console.error('Error generating buy config', error);
      } finally {
        setLoadingBuyConfig(false);
      }
    };

    getBuyconfig();
  }, [setBuyConfig, setLoadingBuyConfig]);

  useEffect(() => {
    if (authenticated && step < 2) {
      setStep(2);
    } else if (!authenticated && step > 1) {
      setStep(1);
    }
  }, [authenticated, step, setStep]);

  return (
    <div className="flex justify-center items-center min-h-screen ">
      <div className="crypto-ramp bg-black p-8 rounded-lg shadow-md w-full h-screen">
        <FundCardDemo />

        <Divider className="my-10" />

        <FundButtonDemo />

        <Divider className="my-10" />
      </div>
    </div>
  );
}
