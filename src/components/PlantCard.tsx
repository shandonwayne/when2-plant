import { Plus, Check, Leaf, Flower2, Sprout, TreeDeciduous } from 'lucide-react';
import type { Plant } from '../types';
import LightIcon from './LightIcon';
import MonthChip from './MonthChip';

interface PlantCardProps {
  plant: Plant;
  isInGarden: boolean;
  userZone: number | null;
  onAdd: (plant: Plant) => void;
  onRemove: (plant: Plant) => void;
  onClick: (plant: Plant) => void;
}

const TYPE_ICONS: Record<string, typeof Leaf> = {
  flower: Flower2,
  vegetable: Sprout,
  herb: Leaf,
  shrub: TreeDeciduous,
};

function getActiveMonths(plant: Plant): number[] {
  if (plant.bloom_months.length > 0) return plant.bloom_months;
  if (plant.harvest_months.length > 0) return plant.harvest_months;
  if (plant.planting_months.length > 0) return plant.planting_months;
  return [];
}

export default function PlantCard({ plant, isInGarden, userZone, onAdd, onRemove, onClick }: PlantCardProps) {
  const months = getActiveMonths(plant);
  const sorted = [...months].sort((a, b) => a - b);
  const Icon = TYPE_ICONS[plant.type] || Leaf;
  const zoneWarning = userZone !== null && (userZone < plant.zone_min || userZone > plant.zone_max);
  const isCustom = (plant as Plant & { is_custom?: boolean }).is_custom === true;

  const hasCustomPhoto = isCustom && !!plant.image_url;

  return (
    <div
      className="group relative bg-cream-50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in border border-earth-200"
      onClick={() => onClick(plant)}
    >
      {hasCustomPhoto && (
        <div className="relative w-full h-20 overflow-hidden bg-earth-100">
          <img
            src={plant.image_url}
            alt={plant.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-earth-900 text-sm uppercase tracking-wide truncate">
                {plant.name}
              </h3>
              {isCustom && (
                <span className="shrink-0 text-[9px] bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  Custom
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <LightIcon requirement={plant.light_requirement} size={12} />
              <Icon size={11} className="text-earth-400 shrink-0" />
              <span className="text-[10px] text-earth-500 uppercase tracking-wider">{plant.type}</span>
              {zoneWarning && (
                <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                  Z{plant.zone_min}–{plant.zone_max}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              isInGarden ? onRemove(plant) : onAdd(plant);
            }}
            className={`
              shrink-0 rounded-full p-1.5 shadow transition-all duration-200
              ${isInGarden
                ? 'bg-sage-500 text-white hover:bg-red-500'
                : 'bg-white text-earth-700 border border-earth-200 hover:bg-sage-400 hover:text-white hover:border-sage-400'
              }
            `}
            aria-label={isInGarden ? 'Remove from garden' : 'Add to garden'}
          >
            {isInGarden ? <Check size={14} /> : <Plus size={14} />}
          </button>
        </div>

        {sorted.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
            {sorted.map((m) => (
              <MonthChip key={m} month={m} size="sm" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
