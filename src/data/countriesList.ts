export interface CountryItem {
  code: string;
  name: string;
  flag: string;
  region: 'Europe' | 'Americas' | 'Asia' | 'Africa' | 'Oceania' | 'Middle East' | 'Global';
  stationCount?: number;
}

export function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode === 'WW' || countryCode === 'GLOBAL') return '🌐';
  const code = countryCode.toUpperCase();
  if (code.length !== 2) return '📻';
  const codePoints = [...code].map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export const COUNTRIES_CATALOG: CountryItem[] = [
  // Global
  { code: '', name: 'Worldwide / All Countries', flag: '🌐', region: 'Global' },

  // --- EUROPE ---
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', stationCount: 2200 },
  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe', stationCount: 2900 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe', stationCount: 4800 },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', region: 'Europe', stationCount: 1650 },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'Europe', stationCount: 1820 },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', region: 'Europe', stationCount: 1140 },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', region: 'Europe', stationCount: 780 },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', region: 'Europe', stationCount: 390 },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', region: 'Europe', stationCount: 420 },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', region: 'Europe', stationCount: 310 },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', region: 'Europe', stationCount: 280 },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', region: 'Europe', stationCount: 340 },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', region: 'Europe', stationCount: 1250 },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', region: 'Europe', stationCount: 610 },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', region: 'Europe', stationCount: 720 },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', region: 'Europe', stationCount: 540 },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', region: 'Europe', stationCount: 950 },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', region: 'Europe', stationCount: 460 },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', region: 'Europe', stationCount: 380 },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', region: 'Europe', stationCount: 520 },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', region: 'Europe', stationCount: 640 },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', region: 'Europe', stationCount: 290 },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', region: 'Europe', stationCount: 310 },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', region: 'Europe', stationCount: 230 },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', region: 'Europe', stationCount: 190 },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', region: 'Europe', stationCount: 160 },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', region: 'Europe', stationCount: 140 },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', region: 'Europe', stationCount: 120 },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', region: 'Europe', stationCount: 110 },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', region: 'Europe', stationCount: 65 },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', region: 'Europe', stationCount: 45 },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', region: 'Europe', stationCount: 180 },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', region: 'Europe', stationCount: 75 },

  // --- AMERICAS ---
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'Americas', stationCount: 5400 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'Americas', stationCount: 1350 },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', region: 'Americas', stationCount: 1200 },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'Americas', stationCount: 3850 },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', region: 'Americas', stationCount: 1480 },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', region: 'Americas', stationCount: 890 },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', region: 'Americas', stationCount: 620 },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', region: 'Americas', stationCount: 510 },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', region: 'Americas', stationCount: 340 },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', region: 'Americas', stationCount: 320 },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', region: 'Americas', stationCount: 220 },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', region: 'Americas', stationCount: 180 },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', region: 'Americas', stationCount: 170 },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲', region: 'Americas', stationCount: 140 },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', region: 'Americas', stationCount: 190 },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', region: 'Americas', stationCount: 130 },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', region: 'Americas', stationCount: 270 },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', region: 'Americas', stationCount: 210 },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺', region: 'Americas', stationCount: 85 },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷', region: 'Americas', stationCount: 190 },
  { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹', region: 'Americas', stationCount: 75 },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳', region: 'Americas', stationCount: 120 },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', region: 'Americas', stationCount: 110 },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', region: 'Americas', stationCount: 95 },

  // --- ASIA ---
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia', stationCount: 860 },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'Asia', stationCount: 380 },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia', stationCount: 1240 },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', region: 'Asia', stationCount: 740 },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', region: 'Asia', stationCount: 620 },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', region: 'Asia', stationCount: 410 },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', region: 'Asia', stationCount: 220 },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', region: 'Asia', stationCount: 190 },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Asia', stationCount: 95 },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', region: 'Asia', stationCount: 180 },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', region: 'Asia', stationCount: 90 },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', region: 'Asia', stationCount: 230 },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', region: 'Asia', stationCount: 140 },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', region: 'Asia', stationCount: 110 },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', region: 'Asia', stationCount: 160 },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭', region: 'Asia', stationCount: 45 },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', region: 'Asia', stationCount: 150 },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', region: 'Asia', stationCount: 65 },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳', region: 'Asia', stationCount: 35 },

  // --- OCEANIA ---
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Oceania', stationCount: 1100 },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', region: 'Oceania', stationCount: 380 },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯', region: 'Oceania', stationCount: 45 },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬', region: 'Oceania', stationCount: 30 },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸', region: 'Oceania', stationCount: 20 },

  // --- MIDDLE EAST ---
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', region: 'Middle East', stationCount: 1350 },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', region: 'Middle East', stationCount: 290 },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', region: 'Middle East', stationCount: 820 },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East', stationCount: 190 },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', region: 'Middle East', stationCount: 160 },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', region: 'Middle East', stationCount: 95 },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', region: 'Middle East', stationCount: 60 },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', region: 'Middle East', stationCount: 50 },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', region: 'Middle East', stationCount: 40 },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶', region: 'Middle East', stationCount: 75 },

  // --- AFRICA ---
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', region: 'Africa', stationCount: 480 },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', region: 'Africa', stationCount: 310 },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', region: 'Africa', stationCount: 290 },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', region: 'Africa', stationCount: 210 },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', region: 'Africa', stationCount: 180 },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', region: 'Africa', stationCount: 240 },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', region: 'Africa', stationCount: 110 },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', region: 'Africa', stationCount: 130 },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', region: 'Africa', stationCount: 120 },
  { code: 'CI', name: 'Ivory Coast', flag: '🇨🇮', region: 'Africa', stationCount: 85 },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', region: 'Africa', stationCount: 190 },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', region: 'Africa', stationCount: 150 },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲', region: 'Africa', stationCount: 95 },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', region: 'Africa', stationCount: 60 },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', region: 'Africa', stationCount: 55 },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬', region: 'Africa', stationCount: 45 },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', region: 'Africa', stationCount: 60 },
];
