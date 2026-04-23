import { Trash2, Leaf, Flower2, Sprout, TreeDeciduous, AlertTriangle } from 'lucide-react';
import type { Plant } from '../types';
import LightIcon from './LightIcon';

interface GardenViewProps {
  plants: Plant[];
  userZone: number | null;
  onRemove: (plant: Plant) => void;
  onSelect: (plant: Plant) => void;
}

const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MONTH_ABBR = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const TYPE_ICONS: Record<string, typeof Leaf> = {
  flower: Flower2,
  vegetable: Sprout,
  herb: Leaf,
  shrub: TreeDeciduous,
};

const MONTH_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: '#1e3a5f', text: '#bfdbfe' },
  2: { bg: '#1e4d7a', text: '#bfdbfe' },
  3: { bg: '#166534', text: '#bbf7d0' },
  4: { bg: '#3A5216', text: '#C8E68A' },
  5: { bg: '#4A6118', text: '#D4EE8A' },
  6: { bg: '#6B6B14', text: '#E8E87A' },
  7: { bg: '#8B6518', text: '#F5D478' },
  8: { bg: '#A04828', text: '#FACBAE' },
  9: { bg: '#A03048', text: '#F8B8C8' },
  10: { bg: '#8A4A68', text: '#E8C0D4' },
  11: { bg: '#5A7A88', text: '#C8E0EA' },
  12: { bg: '#334155', text: '#cbd5e1' },
};

interface TimelineRow {
  label: string;
  months: number[];
  variant: 'plant' | 'harvest' | 'bloom' | 'default';
}

function getTimelineRows(plant: Plant): TimelineRow[] {
  if (plant.type === 'vegetable') {
    const rows: TimelineRow[] = [];
    if (plant.planting_months.length > 0) {
      rows.push({ label: 'Plant', months: plant.planting_months, variant: 'plant' });
    }
    if (plant.harvest_months.length > 0) {
      rows.push({ label: 'Harvest', months: plant.harvest_months, variant: 'harvest' });
    }
    if (rows.length > 0) return rows;
  }
  if (plant.bloom_months.length > 0) return [{ label: 'Bloom', months: plant.bloom_months, variant: 'bloom' }];
  if (plant.harvest_months.length > 0) return [{ label: 'Harvest', months: plant.harvest_months, variant: 'harvest' }];
  if (plant.planting_months.length > 0) return [{ label: 'Plant', months: plant.planting_months, variant: 'plant' }];
  return [];
}

const VARIANT_STYLES: Record<string, { outline: string; opacity: string }> = {
  plant: { outline: 'ring-1 ring-sage-400/40', opacity: 'opacity-90' },
  harvest: { outline: 'ring-1 ring-amber-400/40', opacity: 'opacity-100' },
  bloom: { outline: '', opacity: 'opacity-100' },
  default: { outline: '', opacity: 'opacity-100' },
};

function buildHalfMonthSlots(months: number[]): ('long' | 'short-first' | 'short-second' | null)[] {
  const sorted = [...months].sort((a, b) => a - b);
  const monthSet = new Set(sorted);
  const slots: ('long' | 'short-first' | 'short-second' | null)[] = [];

  for (let m = 1; m <= 12; m++) {
    if (!monthSet.has(m)) {
      slots.push(null, null);
      continue;
    }

    const prevIn = monthSet.has(m - 1 > 0 ? m - 1 : 0);
    const nextIn = monthSet.has(m + 1 <= 12 ? m + 1 : 0);

    if (prevIn && nextIn) {
      slots.push('long', null);
    } else if (!prevIn && nextIn) {
      slots.push(null, 'short-second');
    } else if (prevIn && !nextIn) {
      slots.push('short-first', null);
    } else {
      slots.push('long', null);
    }
  }

  return slots;
}

interface TimelineChipProps {
  month: number;
  type: 'long' | 'short-first' | 'short-second';
  variant: string;
  label: string;
}

function TimelineChip({ month, type, variant, label }: TimelineChipProps) {
  const colors = MONTH_COLORS[month];
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  const isLong = type === 'long';

  return (
    <div
      className={`
        flex items-center justify-center rounded-full font-bold uppercase tracking-wide select-none
        ${styles.outline} ${styles.opacity}
        ${isLong ? 'col-span-2 px-1' : 'col-span-1 px-0.5'}
        h-[22px] text-[9px] sm:text-[10px]
        transition-transform duration-150 hover:scale-105
      `}
      style={{ backgroundColor: colors.bg, color: colors.text }}
      title={`${label}: ${MONTH_LABELS[month - 1]}`}
    >
      {isLong ? MONTH_LABELS[month - 1] : MONTH_LABELS[month - 1].slice(0, 2)}
    </div>
  );
}

function TimelineBar({ row }: { row: TimelineRow }) {
  const slots = buildHalfMonthSlots(row.months);

  return (
    <div className="grid grid-cols-24 gap-[2px] items-center flex-1">
      {slots.map((slot, i) => {
        const monthIndex = Math.floor(i / 2);
        const month = monthIndex + 1;

        if (slot === 'long') {
          return (
            <TimelineChip
              key={i}
              month={month}
              type="long"
              variant={row.variant}
              label={row.label}
            />
          );
        }

        if (slot === 'short-first' || slot === 'short-second') {
          return (
            <TimelineChip
              key={i}
              month={month}
              type={slot}
              variant={row.variant}
              label={row.label}
            />
          );
        }

        if (slot === null) {
          const nextSlot = i + 1 < slots.length ? slots[i + 1] : null;
          const prevSlot = i - 1 >= 0 ? slots[i - 1] : null;

          if (i % 2 === 0 && nextSlot === 'short-second') {
            return <div key={i} className="col-span-1" />;
          }
          if (i % 2 === 1 && prevSlot === 'short-first') {
            return <div key={i} className="col-span-1" />;
          }
          if (i % 2 === 1 && (prevSlot === 'long' || prevSlot === null)) {
            return null;
          }
          if (i % 2 === 0) {
            const next = i + 1 < slots.length ? slots[i + 1] : null;
            if (next === null) {
              return (
                <div key={i} className="col-span-2 flex justify-center">
                  <div className="w-5 h-[6px] rounded-full bg-earth-200/30" />
                </div>
              );
            }
            return <div key={i} className="col-span-1" />;
          }
          return <div key={i} className="col-span-1" />;
        }

        return null;
      })}
    </div>
  );
}

export default function GardenView({ plants, userZone, onRemove, onSelect }: GardenViewProps) {
  const hasZoneWarning = (plant: Plant) =>
    userZone !== null && (userZone < plant.zone_min || userZone > plant.zone_max);

  if (plants.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-earth-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sprout size={28} className="text-earth-400" />
        </div>
        <h3 className="font-display text-lg text-earth-700 font-bold">Your garden is empty</h3>
        <p className="text-sm text-earth-500 mt-1">
          Browse the catalog and add plants to start planning your garden.
        </p>
      </div>
    );
  }

  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="space-y-3">
      <div className="hidden sm:grid grid-cols-[200px_1fr_40px] items-center gap-3">
        <div />
        <div className="grid grid-cols-24 gap-[2px]">
          {ALL_MONTHS.map((m) => (
            <div
              key={m}
              className={`
                col-span-2 text-center text-[10px] font-bold uppercase tracking-wider
                ${m === currentMonth ? 'text-sage-600' : 'text-earth-400'}
              `}
            >
              {MONTH_ABBR[m - 1]}
            </div>
          ))}
        </div>
        <div />
      </div>

      {plants.map((plant) => {
        const Icon = TYPE_ICONS[plant.type] || Leaf;
        const rows = getTimelineRows(plant);
        const isMultiRow = rows.length > 1;

        return (
          <div
            key={plant.id}
            className="group relative bg-white border border-earth-200 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg animate-fade-in"
            onClick={() => onSelect(plant)}
          >
            <div className={`p-3 sm:p-4 ${isMultiRow ? 'space-y-1' : ''}`}>
              <div className="hidden sm:grid grid-cols-[200px_1fr_40px] items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <LightIcon requirement={plant.light_requirement} size={20} />
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-earth-900 text-xs sm:text-sm uppercase tracking-wide truncate">
                      {plant.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Icon size={10} className="text-earth-500 shrink-0" />
                      <span className="text-[9px] text-earth-500 uppercase tracking-wider">
                        {rows[0]?.label || plant.type}
                      </span>
                      {hasZoneWarning(plant) && (
                        <AlertTriangle size={10} className="text-amber-500 shrink-0 ml-1" />
                      )}
                    </div>
                  </div>
                </div>

                <TimelineBar row={rows[0]} />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(plant);
                  }}
                  className="shrink-0 p-2 rounded-full text-earth-400 hover:text-red-500 hover:bg-red-50 transition-all justify-self-center"
                  aria-label="Remove from garden"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {isMultiRow && rows.slice(1).map((row, i) => (
                <div key={i} className="hidden sm:grid grid-cols-[200px_1fr_40px] items-center gap-3">
                  <div className="flex justify-end pr-2">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-earth-500 bg-earth-100/60 px-2 py-0.5 rounded-full">
                      {row.label}
                    </span>
                  </div>
                  <TimelineBar row={row} />
                  <div />
                </div>
              ))}

              <div className="sm:hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <LightIcon requirement={plant.light_requirement} size={20} />
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-earth-900 text-xs uppercase tracking-wide truncate">
                        {plant.name}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(plant);
                    }}
                    className="shrink-0 p-2 rounded-full text-earth-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    aria-label="Remove from garden"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {rows.map((row, i) => (
                  <div key={i} className="mb-1">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-earth-500 mr-2">
                      {row.label}
                    </span>
                    <div className="inline-flex flex-wrap gap-1">
                      {[...row.months].sort((a, b) => a - b).map((m) => {
                        const colors = MONTH_COLORS[m];
                        return (
                          <span
                            key={m}
                            className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                          >
                            {MONTH_LABELS[m - 1]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
