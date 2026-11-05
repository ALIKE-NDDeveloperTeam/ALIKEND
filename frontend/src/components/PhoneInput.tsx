import React, { useState, useEffect } from 'react';
import { COUNTRIES, Country, COUNTRIES_BY_LETTER, DEFAULT_COUNTRY, getInstantDetectedCountry, detectUserCountryAsync } from '../data/countries';
import { ChevronDown } from 'lucide-react';

interface PhoneInputProps {
  id?: string;
  value: string;
  onChange: (fullNumber: string, localNumber: string, country: Country) => void;
  required?: boolean;
  disabled?: boolean;
  isLightMode?: boolean;
  placeholder?: string;
  className?: string;
}

export default function PhoneInput({
  id = 'phone-input',
  value,
  onChange,
  required = false,
  disabled = false,
  isLightMode = false,
  placeholder,
  className = '',
}: PhoneInputProps) {
  const [userManuallySelected, setUserManuallySelected] = useState(false);

  // Find initial country from value, or auto-detect from user's location/timezone
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    if (value && value.startsWith('+')) {
      const match = [...COUNTRIES]
        .sort((a, b) => b.code.length - a.code.length)
        .find((c) => value.startsWith(c.code));
      if (match) return match;
    }
    return getInstantDetectedCountry();
  });

  // Extract local number by stripping country code
  const [localNumber, setLocalNumber] = useState<string>(() => {
    if (!value) return '';
    if (value.startsWith(selectedCountry.code)) {
      return value.slice(selectedCountry.code.length).trim();
    }
    return value.replace(/^\+?[0-9]{1,4}/, '').trim();
  });

  // Auto-detect country based on location if value is empty and user hasn't manually chosen a country
  useEffect(() => {
    if (!value && !userManuallySelected) {
      let active = true;
      detectUserCountryAsync().then((c) => {
        if (active && c && !userManuallySelected) {
          setSelectedCountry(c);
        }
      });
      return () => {
        active = false;
      };
    }
  }, [value, userManuallySelected]);

  // Sync internal state if external value changes drastically
  useEffect(() => {
    if (!value) {
      setLocalNumber('');
      return;
    }
    const match = [...COUNTRIES]
      .sort((a, b) => b.code.length - a.code.length)
      .find((c) => value.startsWith(c.code));
    if (match) {
      setSelectedCountry(match);
      setLocalNumber(value.slice(match.code.length).trim());
    }
  }, [value]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserManuallySelected(true);
    const iso = e.target.value;
    const country = COUNTRIES.find((c) => c.iso === iso) || DEFAULT_COUNTRY;
    setSelectedCountry(country);
    const cleanLocal = localNumber.replace(/[^0-9]/g, '');
    const full = cleanLocal ? `${country.code}${cleanLocal}` : '';
    onChange(full, cleanLocal, country);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Allow digits and hyphens/spaces
    const cleanLocal = rawVal.replace(/[^0-9]/g, '');
    setLocalNumber(rawVal);
    const full = cleanLocal ? `${selectedCountry.code}${cleanLocal}` : '';
    onChange(full, cleanLocal, selectedCountry);
  };

  return (
    <div className={`flex items-stretch gap-2 ${className}`}>
      {/* Country Code Dropdown */}
      <div className="relative shrink-0 w-[130px] sm:w-[150px]">
        <select
          id={`${id}-country`}
          value={selectedCountry.iso}
          onChange={handleCountryChange}
          disabled={disabled}
          className={`w-full h-full appearance-none pl-2.5 pr-7 py-2.5 text-xs font-semibold rounded-xl border outline-none transition-all cursor-pointer ${
            isLightMode
              ? 'bg-white border-neutral-300 text-neutral-900 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]'
              : 'bg-neutral-900 border-neutral-700 text-white focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]'
          }`}
        >
          {Object.entries(COUNTRIES_BY_LETTER).map(([letter, list]) => (
            <optgroup key={letter} label={`── ${letter} ──`}>
              {list.map((c) => (
                <option
                  key={`${c.iso}-${c.code}`}
                  value={c.iso}
                  className={isLightMode ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'}
                >
                  {c.flag} {c.iso} {c.code} ({c.name})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Local Phone Number Input */}
      <div className="flex-1 relative">
        <input
          id={`${id}-number`}
          type="tel"
          inputMode="numeric"
          value={localNumber}
          onChange={handleNumberChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder || `e.g. ${selectedCountry.placeholder}`}
          className={`w-full py-2.5 px-3.5 text-xs font-medium rounded-xl border outline-none transition-all ${
            isLightMode
              ? 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]'
              : 'bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]'
          }`}
        />
      </div>
    </div>
  );
}
