import React, { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Timezone {
  zoneName: string;
  gmtOffset: number;
  gmtOffsetName: string;
  abbreviation: string;
  tzName: string;
}

interface CountryProps {
  id: number;
  name: string;
  iso3: string;
  iso2: string;
  numeric_code: string;
  phone_code: string;
  capital: string;
  currency: string;
  currency_name: string;
  currency_symbol: string;
  tld: string;
  native: string;
  region: string;
  region_id: string;
  subregion: string;
  subregion_id: string;
  nationality: string;
  timezones: Timezone[];
  translations: Record<string, string>;
  latitude: string;
  longitude: string;
  emoji: string;
  emojiU: string;
}

interface StateProps {
  id: number;
  name: string;
  country_id: number;
  country_code: string;
  country_name: string;
  state_code: string;
  type: string | null;
  latitude: string;
  longitude: string;
}

interface LocationSelectorProps {
  disabled?: boolean;
  onCountryChange?: (country: CountryProps | null) => void;
  onStateChange?: (state: StateProps | null) => void;
}

const LocationSelector = ({
  disabled,
  onCountryChange,
  onStateChange,
}: LocationSelectorProps) => {
  const [selectedState, setSelectedState] = useState<StateProps | null>(null);
  const [openStateDropdown, setOpenStateDropdown] = useState(false);

  // Hardcoded Cameroon data
  const cameroonCountry: CountryProps = useMemo(
    () => ({
      id: 38,
      name: "Cameroon",
      iso3: "CMR",
      iso2: "CM",
      numeric_code: "120",
      phone_code: "237",
      capital: "Yaoundé",
      currency: "XAF",
      currency_name: "Central African CFA franc",
      currency_symbol: "FCFA",
      tld: ".cm",
      native: "Cameroon",
      region: "Africa",
      region_id: "1",
      subregion: "Central Africa",
      subregion_id: "3",
      nationality: "Cameroonian",
      timezones: [
        {
          zoneName: "Africa/Douala",
          gmtOffset: 3600,
          gmtOffsetName: "UTC+01:00",
          abbreviation: "WAT",
          tzName: "West Africa Time",
        },
      ],
      translations: {
        fr: "Cameroun",
        de: "Kamerun",
        es: "Camerún",
        it: "Camerun",
        pt: "Camarões",
      },
      latitude: "6.00000000",
      longitude: "12.00000000",
      emoji: "🇨🇲",
      emojiU: "U+1F1E8 U+1F1F2",
    }),
    []
  );

  // Cameroon regions data
  const cameroonRegions: StateProps[] = [
    {
      id: 1,
      name: "Adamawa",
      country_id: 38,
      country_code: "CM",
      country_name: "Cameroon",
      state_code: "AD",
      type: "Region",
      latitude: "7.37378630",
      longitude: "13.37161410",
    },
    {
      id: 2,
      name: "Centre",
      country_id: 38,
      country_code: "CM",
      country_name: "Cameroon",
      state_code: "CE",
      type: "Region",
      latitude: "4.64484600",
      longitude: "11.73150580",
    },
    {
      id: 7,
      name: "East",
      country_id: 38,
      country_code: "CM",
      country_name: "Cameroon",
      state_code: "ES",
      type: "Region",
      latitude: "4.23122450",
      longitude: "13.91035240",
    },
    {
      id: 8,
      name: "Far North",
      country_id: 38,
      country_code: "CM",
      country_name: "Cameroon",
      state_code: "EN",
      type: "Region",
      latitude: "11.23326670",
      longitude: "14.39964770",
    },
    {
      id: 9,
      name: "Littoral",
      country_id: 38,
      country_code: "CM",
      country_name: "Cameroon",
      state_code: "LT",
      type: "Region",
      latitude: "4.17511580",
      longitude: "10.21849520",
    },
    {
      id: 10,
      name: "North",
      country_id: 38,
      country_code: "CM",
      country_name: "Cameroon",
      state_code: "NO",
      type: "Region",
      latitude: "9.38289260",
      longitude: "13.91035240",
    },
    {
      id: 11,
      name: "Northwest",
      country_id: 38,
      country_code: "CM",
      country_name: "Cameroon",
      state_code: "NW",
      type: "Region",
      latitude: "6.33265280",
      longitude: "10.58845270",
    },
    {
      id: 12,
      name: "South",
      country_id: 38,
      country_code: "CM",
      country_name: "Cameroon",
      state_code: "SU",
      type: "Region",
      latitude: "2.64774460",
      longitude: "11.73150580",
    },
    {
      id: 13,
      name: "Southwest",
      country_id: 38,
      country_code: "CM",
      country_name: "Cameroon",
      state_code: "SW",
      type: "Region",
      latitude: "5.44768350",
      longitude: "9.94707220",
    },
    {
      id: 14,
      name: "West",
      country_id: 38,
      country_code: "CM",
      country_name: "Cameroon",
      state_code: "OU",
      type: "Region",
      latitude: "5.44768350",
      longitude: "10.58845270",
    },
  ];

  // Set Cameroon as default country on component mount
  useEffect(() => {
    if (onCountryChange) {
      onCountryChange(cameroonCountry);
    }
  }, [cameroonCountry, onCountryChange]); // Empty dependency array - only run once on mount

  const handleStateSelect = (state: StateProps | null) => {
    setSelectedState(state);
    onStateChange?.(state);
  };

  return (
    <div className='flex gap-4'>
      {/* Country Display - Fixed to Cameroon */}
      <div className='w-full'>
        <div className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background'>
          <div className='flex items-center gap-2'>
            <span>{cameroonCountry.emoji}</span>
            <span>{cameroonCountry.name}</span>
          </div>
        </div>
      </div>

      {/* Region Selector */}
      <Popover open={openStateDropdown} onOpenChange={setOpenStateDropdown}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={openStateDropdown}
            disabled={disabled}
            className=' justify-between'
          >
            {selectedState ? (
              <span>{selectedState.name}</span>
            ) : (
              <span>Select Region...</span>
            )}
            <ChevronsUpDown className='h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='p-0'>
          <Command>
            <CommandInput placeholder='Search region...' />
            <CommandList>
              <CommandEmpty>No region found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className='h-[300px]'>
                  {cameroonRegions.map(region => (
                    <CommandItem
                      key={region.id}
                      value={region.name}
                      onSelect={() => {
                        handleStateSelect(region);
                        setOpenStateDropdown(false);
                      }}
                      className='flex cursor-pointer items-center justify-between text-sm'
                    >
                      <span>{region.name}</span>
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selectedState?.id === region.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                  <ScrollBar orientation='vertical' />
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LocationSelector;
