import { X, Droplets, Ruler, Clock, MapPin, Plus, Check, AlertTriangle } from 'lucide-react';
import type { Plant } from '../types';
import LightIcon from './LightIcon';
import MonthTimeline from './MonthTimeline';

interface PlantDetailModalProps {
  plant: Plant;
  isInGarden: boolean;
  userZone: number | null;
  onAdd: (plant: Plant) => void;
  onRemove: (plant: Plant) => void;
  onClose: () => void;
}

const LIGHT_LABELS = {
  full_sun: 'Full Sun',
  partial_sun: 'Partial Sun',
  shade: 'Shade',
};

const WATER_LABELS = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
};

export default function PlantDetailModal({
  plant,
  isInGarden,
  userZone,
  onAdd,
  onRemove,
  onClose,
}: PlantDetailModalProps) {
  const zoneWarning = userZone !== null && (userZone < plant.zone_min || userZone > plant.zone_max);
  const isCustom = (plant as Plant & { is_custom?: boolean }).is_custom === true;
  const hasCustomPhoto = isCustom && !!(plant.closeup_image_url || plant.image_url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      <div
        className="relative bg-cream-50 rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-20 rounded-full p-2 transition-colors ${
            hasCustomPhoto
              ? 'bg-black/40 backdrop-blur-sm text-white hover:bg-black/60'
              : 'bg-earth-100 text-earth-600 hover:bg-earth-200'
          }`}
        >
          <X size={18} />
        </button>

        {hasCustomPhoto ? (
          <div className="relative h-64 sm:h-80">
            <img
              src={plant.closeup_image_url || plant.image_url}
              alt={`${plant.name} close-up`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="text-[11px] uppercase tracking-widest text-cream-300 font-semibold">
                {plant.type}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide mt-1">
                {plant.name}
              </h2>
              {plant.scientific_name && (
                <p className="text-cream-300 text-sm italic mt-0.5">{plant.scientific_name}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="px-6 pt-10 pb-4">
            <span className="text-[11px] uppercase tracking-widest text-earth-400 font-semibold">
              {plant.type}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-earth-900 uppercase tracking-wide mt-1">
              {plant.name}
            </h2>
            {plant.scientific_name && (
              <p className="text-earth-500 text-sm italic mt-0.5">{plant.scientific_name}</p>
            )}
          </div>
        )}

        <div className="p-6 space-y-6">
          {zoneWarning && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Climate Zone Warning</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  This plant thrives in zones {plant.zone_min}-{plant.zone_max}, but your garden is in
                  zone {userZone}. It may require extra care or protection to grow successfully.
                </p>
              </div>
            </div>
          )}

          <p className="text-earth-700 text-sm leading-relaxed">{plant.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-earth-50 rounded-xl p-3 text-center">
              <div className="flex justify-center mb-1.5">
                <LightIcon requirement={plant.light_requirement} size={24} />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-earth-500 font-semibold">Light</p>
              <p className="text-xs text-earth-800 font-medium mt-0.5">
                {LIGHT_LABELS[plant.light_requirement]}
              </p>
            </div>
            <div className="bg-earth-50 rounded-xl p-3 text-center">
              <div className="flex justify-center mb-1.5">
                <Droplets size={24} className="text-sky-500" />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-earth-500 font-semibold">Water</p>
              <p className="text-xs text-earth-800 font-medium mt-0.5">
                {WATER_LABELS[plant.water_needs]}
              </p>
            </div>
            <div className="bg-earth-50 rounded-xl p-3 text-center">
              <div className="flex justify-center mb-1.5">
                <MapPin size={24} className="text-sage-500" />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-earth-500 font-semibold">Zones</p>
              <p className="text-xs text-earth-800 font-medium mt-0.5">
                {plant.zone_min} - {plant.zone_max}
              </p>
            </div>
            <div className="bg-earth-50 rounded-xl p-3 text-center">
              <div className="flex justify-center mb-1.5">
                <Ruler size={24} className="text-earth-400" />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-earth-500 font-semibold">Height</p>
              <p className="text-xs text-earth-800 font-medium mt-0.5">
                {plant.height_inches_min}"-{plant.height_inches_max}"
              </p>
            </div>
          </div>

          {plant.days_to_maturity > 0 && (
            <div className="flex items-center gap-2 text-sm text-earth-600">
              <Clock size={14} />
              <span>{plant.days_to_maturity} days to maturity</span>
            </div>
          )}

          <div className="space-y-2.5">
            {plant.planting_months.length > 0 && (
              <MonthTimeline months={plant.planting_months} label="Plant" />
            )}
            {plant.bloom_months.length > 0 && (
              <MonthTimeline months={plant.bloom_months} label="Bloom" />
            )}
            {plant.harvest_months.length > 0 && (
              <MonthTimeline months={plant.harvest_months} label="Harvest" />
            )}
          </div>

          <button
            onClick={() => (isInGarden ? onRemove(plant) : onAdd(plant))}
            className={`
              w-full rounded-xl py-3 px-4 font-semibold text-sm flex items-center justify-center gap-2
              transition-all duration-200
              ${isInGarden
                ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                : 'bg-sage-600 text-white hover:bg-sage-700 shadow-lg shadow-sage-600/25'
              }
            `}
          >
            {isInGarden ? (
              <>
                <Check size={16} />
                Remove from Garden
              </>
            ) : (
              <>
                <Plus size={16} />
                Add to My Garden
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
