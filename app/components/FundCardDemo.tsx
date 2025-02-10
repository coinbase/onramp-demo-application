'use client';
import { Card, CardBody, CardHeader, Code, Input } from '@nextui-org/react';
import { useState } from 'react';

import { FundCard, FundCardPropsReact } from '@coinbase/onchainkit/fund';
import { RegionSelector } from './RegionSelector';

export const FundCardDemo = () => {
  const [currency, setCurrency] = useState('USD');
  const [asset, setAsset] = useState('BTC');
  const [country, setCountry] = useState('US');
  const [subdivision, setSubdivision] = useState('CA');
  const [presetAmountInputs, setPresetAmountInputs] = useState<
    FundCardPropsReact['presetAmountInputs']
  >(['10', '20', '30']);

  return (
    <div className="flex flex-col items-center justify-center">
      <Code className="text-white text-2xl p-4">{'<FundCard />'}</Code>
      <p className="text-white text-sm cursor-pointer text-blue-500">
        <a
          href="https://onchainkit.xyz/fund/fund-card"
          target="_blank"
          rel="noopener noreferrer"
        >
          See full documentation here
        </a>
      </p>

      <div className="flex flex-col gap-2 items-center p-4">
        <Card>
          <CardHeader>
            <p className="text-white text-lg">Fund card props</p>
          </CardHeader>
          <CardBody>
            <div>
              <RegionSelector
                onCountryChange={(country) => {
                  setCountry(country);
                }}
                onSubdivisionChange={(subdivision) => {
                  setSubdivision(subdivision);
                }}
              />
            </div>
            <div className="flex pt-4 pb-4  gap-2 flex-wrap">
              <Input
                placeholder="currency (3 letter)"
                label="currency (3 letters)"
                variant="bordered"
                value={currency}
                className="w-[150px]"
                onChange={(e) => {
                  setCurrency(e.target.value);
                }}
              />

              <Input
                placeholder="asset"
                label="asset"
                variant="bordered"
                value={asset}
                className="w-[150px]"
                onChange={(e) => {
                  setAsset(e.target.value);
                }}
              />

              <Input
                placeholder="presetAmountInputs"
                label="presetAmountInputs"
                variant="bordered"
                className="w-[150px]"
                value={presetAmountInputs?.join(',')}
                onChange={(e) => {
                  setPresetAmountInputs(
                    e.target.value.split(
                      ','
                    ) as unknown as FundCardPropsReact['presetAmountInputs']
                  );
                }}
              />
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-center items-center w-[500px] gap-4 flex-col">
        <FundCard
          key={`${asset}-${country}-${currency}-${subdivision}`}
          assetSymbol={asset}
          country={country}
          currency={currency?.length === 3 ? currency : 'USD'}
          subdivision={subdivision}
          presetAmountInputs={presetAmountInputs}
        />
      </div>
    </div>
  );
};
