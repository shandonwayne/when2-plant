import { AlertTriangle, X } from 'lucide-react';
import type { Plant } from '../types';

interface ClimateZoneWarningProps {
  plant: Plant;
  userZone: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ClimateZoneWarning({ plant, userZone, onConfirm, onCancel }: ClimateZoneWarningProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      <div
        className="relative bg-white rounded-2xl overflow-hidden max-w-md w-full shadow-2xl animate-scale-in p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-earth-400 hover:text-earth-600 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div className="bg-amber-100 rounded-full p-3 shrink-0">
            <AlertTriangle size={24} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-display font-bold text-earth-900 text-lg">Climate Zone Mismatch</h3>
            <p className="text-sm text-earth-600 mt-2 leading-relaxed">
              <span className="font-semibold text-earth-800">{plant.name}</span> grows best in
              USDA zones {plant.zone_min}-{plant.zone_max}, but your garden is in
              zone {userZone}. This plant may struggle or require extra protection in your area.
            </p>
            <p className="text-sm text-earth-500 mt-2">
              Would you still like to add it?
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl py-2.5 px-4 text-sm font-medium bg-earth-100 text-earth-700 hover:bg-earth-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl py-2.5 px-4 text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors"
          >
            Add Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
