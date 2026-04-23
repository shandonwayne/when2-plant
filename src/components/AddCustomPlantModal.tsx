import { useState, useRef } from 'react';
import { X, Leaf, Image, Upload, Loader2 } from 'lucide-react';
import type { Plant, PlantType, LightRequirement, WaterNeeds } from '../types';
import { supabase } from '../lib/supabase';

interface AddCustomPlantModalProps {
  userId: string;
  onSave: (fields: Omit<Plant, 'id' | 'created_at' | 'closeup_image_url'>) => Promise<void>;
  onClose: () => void;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function MonthToggle({ label, selected, onChange }: {
  label: string;
  selected: number[];
  onChange: (months: number[]) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-earth-500 font-semibold mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-1">
        {MONTHS.map((m, i) => {
          const n = i + 1;
          const active = selected.includes(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(active ? selected.filter((x) => x !== n) : [...selected, n])}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all border ${
                active
                  ? 'bg-sage-600 text-white border-sage-600'
                  : 'bg-earth-50 text-earth-600 border-earth-200 hover:bg-earth-100'
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AddCustomPlantModal({ userId, onSave, onClose }: AddCustomPlantModalProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [type, setType] = useState<PlantType>('flower');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [light, setLight] = useState<LightRequirement>('full_sun');
  const [water, setWater] = useState<WaterNeeds>('moderate');
  const [zoneMin, setZoneMin] = useState(1);
  const [zoneMax, setZoneMax] = useState(13);
  const [bloomMonths, setBloomMonths] = useState<number[]>([]);
  const [plantingMonths, setPlantingMonths] = useState<number[]>([]);
  const [harvestMonths, setHarvestMonths] = useState<number[]>([]);
  const [heightMin, setHeightMin] = useState('');
  const [heightMax, setHeightMax] = useState('');
  const [daysToMaturity, setDaysToMaturity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const finalImageUrl = imageMode === 'upload' ? uploadPreview : imageUrl.trim();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('plant-photos').upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('plant-photos').getPublicUrl(path);
      setUploadPreview(data.publicUrl);
    }
    setUploading(false);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (zoneMin > zoneMax) e.zone = 'Min zone must be <= max zone';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await onSave({
      name: name.trim(),
      scientific_name: scientificName.trim(),
      type,
      description: description.trim(),
      image_url: finalImageUrl,
      light_requirement: light,
      water_needs: water,
      zone_min: zoneMin,
      zone_max: zoneMax,
      bloom_months: bloomMonths,
      planting_months: plantingMonths,
      harvest_months: harvestMonths,
      height_inches_min: parseInt(heightMin) || 0,
      height_inches_max: parseInt(heightMax) || 0,
      days_to_maturity: parseInt(daysToMaturity) || 0,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-earth-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sage-50 rounded-lg flex items-center justify-center">
              <Leaf size={16} className="text-sage-600" />
            </div>
            <h2 className="font-display font-bold text-earth-900 text-base">Add Custom Plant</h2>
          </div>
          <button onClick={onClose} className="text-earth-400 hover:text-earth-600 transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-earth-500 font-semibold mb-1.5">
              Common Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
              placeholder="e.g. Sunflower"
              className={`w-full px-3 py-2 bg-earth-50 border rounded-lg text-sm text-earth-800 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all ${errors.name ? 'border-red-300' : 'border-earth-200'}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Scientific name */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-earth-500 font-semibold mb-1.5">
              Scientific Name
            </label>
            <input
              type="text"
              value={scientificName}
              onChange={(e) => setScientificName(e.target.value)}
              placeholder="e.g. Helianthus annuus"
              className="w-full px-3 py-2 bg-earth-50 border border-earth-200 rounded-lg text-sm text-earth-800 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-earth-500 font-semibold mb-1.5">
              Type
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['flower','vegetable','herb','shrub'] as PlantType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${type === t ? 'bg-sage-600 text-white' : 'bg-earth-50 text-earth-600 border border-earth-200 hover:bg-earth-100'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Photo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] uppercase tracking-widest text-earth-500 font-semibold">
                Photo
              </label>
              <div className="flex rounded-lg overflow-hidden border border-earth-200 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2.5 py-1 transition-all ${imageMode === 'upload' ? 'bg-sage-600 text-white' : 'bg-white text-earth-500 hover:bg-earth-50'}`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2.5 py-1 transition-all ${imageMode === 'url' ? 'bg-sage-600 text-white' : 'bg-white text-earth-500 hover:bg-earth-50'}`}
                >
                  URL
                </button>
              </div>
            </div>

            {imageMode === 'upload' ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 py-2 bg-earth-50 hover:bg-earth-100 border border-earth-200 border-dashed rounded-lg text-sm text-earth-600 transition-all disabled:opacity-60"
                >
                  {uploading
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Upload size={14} />
                  }
                  {uploading ? 'Uploading...' : 'Choose photo'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {uploadPreview ? (
                  <div className="relative">
                    <img src={uploadPreview} alt="" className="w-14 h-14 rounded-xl object-cover border border-earth-200" />
                    <button
                      type="button"
                      onClick={() => setUploadPreview('')}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X size={9} />
                    </button>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-earth-100 flex items-center justify-center shrink-0">
                    <Image size={18} className="text-earth-300" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 bg-earth-50 border border-earth-200 rounded-lg text-sm text-earth-800 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all"
                />
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-earth-200 shrink-0" onError={(e) => (e.currentTarget.style.display = 'none')} />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-earth-100 flex items-center justify-center shrink-0">
                    <Image size={14} className="text-earth-400" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-earth-500 font-semibold mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Notes about this plant..."
              className="w-full px-3 py-2 bg-earth-50 border border-earth-200 rounded-lg text-sm text-earth-800 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all resize-none"
            />
          </div>

          {/* Light + Water */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-earth-500 font-semibold mb-1.5">
                Light
              </label>
              <select
                value={light}
                onChange={(e) => setLight(e.target.value as LightRequirement)}
                className="w-full px-3 py-2 bg-earth-50 border border-earth-200 rounded-lg text-sm text-earth-800 focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all"
              >
                <option value="full_sun">Full Sun</option>
                <option value="partial_sun">Partial Sun</option>
                <option value="shade">Shade</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-earth-500 font-semibold mb-1.5">
                Water Needs
              </label>
              <select
                value={water}
                onChange={(e) => setWater(e.target.value as WaterNeeds)}
                className="w-full px-3 py-2 bg-earth-50 border border-earth-200 rounded-lg text-sm text-earth-800 focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all"
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Zone range */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-earth-500 font-semibold mb-1.5">
              USDA Zone Range
            </label>
            <div className="flex items-center gap-2">
              <select
                value={zoneMin}
                onChange={(e) => { setZoneMin(Number(e.target.value)); setErrors((p) => ({ ...p, zone: '' })); }}
                className="flex-1 px-3 py-2 bg-earth-50 border border-earth-200 rounded-lg text-sm text-earth-800 focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all"
              >
                {Array.from({ length: 13 }, (_, i) => i + 1).map((z) => (
                  <option key={z} value={z}>Zone {z}</option>
                ))}
              </select>
              <span className="text-earth-400 text-sm">to</span>
              <select
                value={zoneMax}
                onChange={(e) => { setZoneMax(Number(e.target.value)); setErrors((p) => ({ ...p, zone: '' })); }}
                className="flex-1 px-3 py-2 bg-earth-50 border border-earth-200 rounded-lg text-sm text-earth-800 focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all"
              >
                {Array.from({ length: 13 }, (_, i) => i + 1).map((z) => (
                  <option key={z} value={z}>Zone {z}</option>
                ))}
              </select>
            </div>
            {errors.zone && <p className="text-xs text-red-500 mt-1">{errors.zone}</p>}
          </div>

          {/* Height + Days */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-earth-500 font-semibold mb-1.5">
                Min Height (in)
              </label>
              <input type="number" min={0} value={heightMin} onChange={(e) => setHeightMin(e.target.value)}
                className="w-full px-3 py-2 bg-earth-50 border border-earth-200 rounded-lg text-sm text-earth-800 focus:outline-none focus:ring-2 focus:ring-sage-400/50 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-earth-500 font-semibold mb-1.5">
                Max Height (in)
              </label>
              <input type="number" min={0} value={heightMax} onChange={(e) => setHeightMax(e.target.value)}
                className="w-full px-3 py-2 bg-earth-50 border border-earth-200 rounded-lg text-sm text-earth-800 focus:outline-none focus:ring-2 focus:ring-sage-400/50 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-earth-500 font-semibold mb-1.5">
                Days to Maturity
              </label>
              <input type="number" min={0} value={daysToMaturity} onChange={(e) => setDaysToMaturity(e.target.value)}
                className="w-full px-3 py-2 bg-earth-50 border border-earth-200 rounded-lg text-sm text-earth-800 focus:outline-none focus:ring-2 focus:ring-sage-400/50 transition-all" />
            </div>
          </div>

          {/* Month toggles */}
          <MonthToggle label="Bloom Months" selected={bloomMonths} onChange={setBloomMonths} />
          <MonthToggle label="Planting Months" selected={plantingMonths} onChange={setPlantingMonths} />
          <MonthToggle label="Harvest Months" selected={harvestMonths} onChange={setHarvestMonths} />

          <div className="pt-1 pb-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full py-2.5 bg-sage-600 hover:bg-sage-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all"
            >
              {saving ? 'Saving...' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
