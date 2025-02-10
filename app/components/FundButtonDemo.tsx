'use client';
import {
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Code,
  Input,
} from '@nextui-org/react';
import { useState } from 'react';

import { FundButton } from '@coinbase/onchainkit/fund';

export const FundButtonDemo = () => {
  const [text, setText] = useState('Fund');
  const [hideIcon, setHideIcon] = useState(false);
  const [fiatCurrency, setFiatCurrency] = useState('USD');

  return (
    <div className="flex flex-col items-center justify-center">
      <Code className="text-white text-2xl p-4">{'<FundButton />'}</Code>
      <p className="text-white text-sm cursor-pointer text-blue-500">
        <a
          href="https://onchainkit.xyz/fund/fund-button"
          target="_blank"
          rel="noopener noreferrer"
        >
          See full documentation here
        </a>
      </p>

      <div className="flex flex-col gap-2 items-center p-4">
        <Card>
          <CardHeader>
            <p className="text-white text-lg">Fund button props</p>
          </CardHeader>
          <CardBody>
            <div className="flex pt-4 pb-4  gap-2 flex-wrap">
              <Input
                placeholder="text"
                label="text"
                variant="bordered"
                value={text}
                className="w-[150px]"
                onChange={(e) => {
                  setText(e.target.value);
                }}
              />

              <Input
                placeholder="fiatCurrency"
                label="fiatCurrency"
                variant="bordered"
                value={fiatCurrency}
                className="w-[150px]"
                onChange={(e) => {
                  setFiatCurrency(e.target.value);
                }}
              />

              <div className="flex flex-col gap-2 items-center">
                <p className="text-default-500">
                  hideIcon: {hideIcon ? 'true' : 'false'}
                </p>
                <Checkbox
                  placeholder="hideIcon"
                  className="w-[150px]"
                  isSelected={hideIcon}
                  onValueChange={(e) => {
                    setHideIcon(e);
                  }}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-center items-center w-[500px] gap-4 flex-col">
        <FundButton
          key={`${text}-${fiatCurrency}`}
          hideIcon={hideIcon}
          text={text}
          fiatCurrency={fiatCurrency}
        />
      </div>
    </div>
  );
};
