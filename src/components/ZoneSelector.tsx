import { useState } from 'react';
import { MapPin, ChevronDown, Search, Loader2 } from 'lucide-react';

interface ZoneSelectorProps {
  zone: number | null;
  onZoneChange: (zone: number) => void;
  compact?: boolean;
}

const ZONES = Array.from({ length: 13 }, (_, i) => i + 1);

const ZONE_DESCRIPTIONS: Record<number, string> = {
  1: 'Extreme cold (-60 to -50F)',
  2: 'Very cold (-50 to -40F)',
  3: 'Cold (-40 to -30F)',
  4: 'Cold (-30 to -20F)',
  5: 'Moderate cold (-20 to -10F)',
  6: 'Moderate (-10 to 0F)',
  7: 'Mild (0 to 10F)',
  8: 'Mild (10 to 20F)',
  9: 'Warm (20 to 30F)',
  10: 'Warm (30 to 40F)',
  11: 'Hot (40 to 50F)',
  12: 'Very hot (50 to 60F)',
  13: 'Tropical (60 to 70F)',
};

interface FrostlineResponse {
  zone: string;
  temperature_range: string;
  coordinates: { lat: string; lon: string };
}

function parseZoneNumber(zoneStr: string): number | null {
  const match = zoneStr.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export default function ZoneSelector({ zone, onZoneChange, compact = false }: ZoneSelectorProps) {
  const [zipCode, setZipCode] = useState('');
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState('');
  const [zipResult, setZipResult] = useState<{ zone: string; tempRange: string } | null>(null);

  async function lookupZip(zip: string) {
    if (!/^\d{5}$/.test(zip)) {
      setZipError('Enter a 5-digit ZIP code');
      return;
    }

    setZipLoading(true);
    setZipError('');
    setZipResult(null);

    try {
      const res = await fetch(`https://phzmapi.org/${zip}.json`);
      if (!res.ok) {
        setZipError('No zone data for this ZIP code');
        return;
      }
      const data: FrostlineResponse = await res.json();
      const zoneNum = parseZoneNumber(data.zone);
      if (!zoneNum || zoneNum < 1 || zoneNum > 13) {
        setZipError('Could not determine zone');
        return;
      }
      setZipResult({ zone: data.zone, tempRange: data.temperature_range });
      onZoneChange(zoneNum);
    } catch {
      setZipError('Could not look up ZIP code');
    } finally {
      setZipLoading(false);
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative inline-flex items-center">
          <MapPin size={14} className="text-sage-600 mr-1" />
          <select
            value={zone ?? ''}
            onChange={(e) => onZoneChange(Number(e.target.value))}
            className="appearance-none bg-transparent text-xs font-semibold text-earth-700 pr-5 cursor-pointer focus:outline-none"
          >
            <option value="" disabled>Zone</option>
            {ZONES.map((z) => (
              <option key={z} value={z}>Zone {z}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-0 text-earth-400 pointer-events-none" />
        </div>

        <div className="relative inline-flex items-center gap-1">
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="ZIP"
            value={zipCode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 5);
              setZipCode(val);
              if (val.length === 5) lookupZip(val);
            }}
            className="w-16 text-xs bg-earth-50 border border-earth-200 rounded-md px-2 py-1 text-earth-700 placeholder:text-earth-400 focus:outline-none focus:ring-1 focus:ring-sage-400 focus:border-sage-400"
          />
          {zipLoading && <Loader2 size={12} className="text-sage-500 animate-spin" />}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-earth-200 p-6 max-w-md mx-auto animate-scale-in">
      <div className="text-center mb-5">
        <div className="w-12 h-12 bg-sage-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <MapPin size={22} className="text-sage-600" />
        </div>
        <h3 className="font-display text-lg font-bold text-earth-900">Select Your Climate Zone</h3>
        <p className="text-sm text-earth-500 mt-1">
          Choose your USDA Plant Hardiness Zone or enter your ZIP code to auto-detect it.
        </p>
      </div>

      <div className="mb-5">
        <label className="block text-xs font-semibold text-earth-600 uppercase tracking-wider mb-2">
          Look up by ZIP code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="e.g. 90210"
            value={zipCode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 5);
              setZipCode(val);
              setZipError('');
              setZipResult(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') lookupZip(zipCode);
            }}
            className="flex-1 bg-earth-50 border border-earth-200 rounded-lg px-3 py-2 text-sm text-earth-700 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all"
          />
          <button
            onClick={() => lookupZip(zipCode)}
            disabled={zipLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-sage-600 text-white text-sm font-semibold rounded-lg hover:bg-sage-700 disabled:opacity-50 transition-all"
          >
            {zipLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Search size={14} />
            )}
            Look up
          </button>
        </div>

        {zipError && (
          <p className="text-xs text-red-500 mt-1.5 animate-fade-in">{zipError}</p>
        )}
        {zipResult && (
          <p className="text-xs text-sage-600 mt-1.5 animate-fade-in">
            Zone {zipResult.zone} &mdash; {zipResult.tempRange}&deg;F min. avg. temp
          </p>
        )}
      </div>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-earth-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-[10px] text-earth-400 uppercase tracking-widest">or select manually</span>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-4">
        {ZONES.map((z) => (
          <button
            key={z}
            onClick={() => onZoneChange(z)}
            className={`
              rounded-lg py-2 text-sm font-bold transition-all
              ${zone === z
                ? 'bg-sage-600 text-white shadow-md shadow-sage-600/20'
                : 'bg-earth-50 text-earth-600 hover:bg-earth-100'
              }
            `}
          >
            {z}
          </button>
        ))}
      </div>

      {zone && (
        <p className="text-center text-xs text-earth-500 animate-fade-in">
          Zone {zone}: {ZONE_DESCRIPTIONS[zone]}
        </p>
      )}
    </div>
  );
}