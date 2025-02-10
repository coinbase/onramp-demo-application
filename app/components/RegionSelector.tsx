import { fetchOnrampConfig } from '@coinbase/onchainkit/fund';
import {
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Skeleton,
} from '@nextui-org/react';
import { Key } from '@react-types/shared';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

const mockCountries = [
  {
    id: 'US',
    name: 'United States',
    subdivisions: ['CA', 'NY', 'TX'],
  },
  {
    id: 'CA',
    name: 'Canada',
    subdivisions: ['ON', 'BC', 'QC'],
  },
  {
    id: 'MX',
    name: 'Mexico',
    subdivisions: ['MX', 'MX', 'MX'],
  },
];

export const RegionSelector = ({
  onCountryChange,
  onSubdivisionChange,
}: {
  onCountryChange: (country: string) => void;
  onSubdivisionChange: (subdivision: string) => void;
}) => {
  const [selectedCountry, setSelectedCountry] = useState(mockCountries[0]);
  const [subdivision, setSubdivision] = useState('CA');
  const [countries, setCountries] = useState([]);
  // const [config, setConfig] = useState(null);
  const [loadingBuyConfig, setLoadingBuyConfig] = useState(false);
  useEffect(() => {
    const fetchConfig = async () => {
      setLoadingBuyConfig(true);
      const config = await fetchOnrampConfig();

      // TODO: Use actual countries from the config once util fix id available in prod https://github.com/coinbase/onchainkit/pull/1940
      setCountries(mockCountries);
      setLoadingBuyConfig(false);
    };
    fetchConfig();
  }, []);

  const subdivisions = useMemo(() => {
    if (selectedCountry) {
      return selectedCountry.subdivisions;
    }

    return [];
  }, [selectedCountry]);

  const handleCountrySelectionChange = (selectedKey: Key | null) => {
    if (selectedKey) {
      const country = countries.find((country) => country.id === selectedKey)!;
      setSelectedCountry(country);
      onCountryChange(country.id);
    }
  };

  const handleSubdivisionSelectionChange = (selectedKey: Key | null) => {
    if (selectedKey) {
      const subdivision = selectedCountry?.subdivisions.find(
        (subdivision) => subdivision === selectedKey
      );

      if (subdivision) {
        setSubdivision(subdivision);
        onSubdivisionChange(subdivision);
      }
    }
  };

  return (
    <div className="flex flex-row gap-4 m-auto">
      {loadingBuyConfig ? (
        <>
          <Skeleton className="h-10 w-[200px] rounded-lg" />
          <Skeleton className="h-10 w-[150px] rounded-lg" />
        </>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 md:gap-2">
          <Autocomplete
            isClearable={false}
            variant="underlined"
            onSelectionChange={handleCountrySelectionChange}
            className="max-w-[200px] mx-auto sm:mx-0"
            label="Select country"
            selectedKey={selectedCountry?.id}
            startContent={
              selectedCountry && (
                <Image
                  src={`https://flagcdn.com/${selectedCountry?.id.toLowerCase()}.svg`}
                  alt={selectedCountry?.id || 'selectedCountry'}
                  width={24}
                  height={24}
                />
              )
            }
          >
            {countries.map(({ id, name }) => (
              <AutocompleteItem
                key={id}
                value={id}
                startContent={
                  <Avatar
                    alt={id}
                    className="w-6 h-6"
                    src={`https://flagcdn.com/${id.toLowerCase()}.svg`}
                  />
                }
              >
                {name}
              </AutocompleteItem>
            ))}
          </Autocomplete>

          {subdivisions.length > 0 && (
            <Autocomplete
              isClearable={false}
              variant="underlined"
              onSelectionChange={handleSubdivisionSelectionChange}
              className="max-w-[150px] mx-auto sm:mx-0"
              label="Select State/Division"
              selectedKey={subdivision}
            >
              {subdivisions.map((subdivision) => (
                <AutocompleteItem key={subdivision} value={subdivision}>
                  {subdivision}
                </AutocompleteItem>
              ))}
            </Autocomplete>
          )}
        </div>
      )}
    </div>
  );
};
