import { useState, useMemo } from 'react';
import { Search, Filter, X, Plus, Loader2, Leaf, Flower2, Sprout, TreeDeciduous, Download } from 'lucide-react';
import type { Plant, PlantType, LightRequirement } from '../types';
import PlantCard from './PlantCard';
import LightIcon from './LightIcon';
import MonthChip from './MonthChip';
import { usePerenualSearch, type PerenualResult } from '../hooks/usePerenualSearch';

interface CatalogViewProps {
  plants: Plant[];
  gardenPlantIds: Set<string>;
  userZone: number | null;
  onAdd: (plant: Plant) => void;
  onRemove: (plant: Plant) => void;
  onSelect: (plant: Plant) => void;
  onAddCustom: () => void;
  onImportPerenual: (result: PerenualResult) => Promise<Plant | null>;
  importedPerenualIds: Set<number>;
}

const TYPE_FILTERS: { value: PlantType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'flower', label: 'Flowers' },
  { value: 'vegetable', label: 'Vegetables' },
  { value: 'herb', label: 'Herbs' },
  { value: 'shrub', label: 'Shrubs' },
];

const LIGHT_FILTERS: { value: LightRequirement | 'all'; label: string }[] = [
  { value: 'all', label: 'Any Light' },
  { value: 'full_sun', label: 'Full Sun' },
  { value: 'partial_sun', label: 'Partial Sun' },
  { value: 'shade', label: 'Shade' },
];

const TYPE_ICONS: Record<string, typeof Leaf> = {
  flower: Flower2,
  vegetable: Sprout,
  herb: Leaf,
  shrub: TreeDeciduous,
};

function PerenualCard({
  result,
  onImport,
  alreadyImported,
}: {
  result: PerenualResult;
  onImport: () => Promise<void>;
  alreadyImported: boolean;
}) {
  const [importing, setImporting] = useState(false);
  const Icon = TYPE_ICONS[result.type] || Leaf;
  const months = result.bloom_months.length > 0 ? result.bloom_months : result.planting_months;
  const sorted = [...months].sort((a, b) => a - b);

  async function handleImport(e: React.MouseEvent) {
    e.stopPropagation();
    if (alreadyImported || importing) return;
    setImporting(true);
    await onImport();
    setImporting(false);
  }

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-blue-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in">
      <div className="relative w-full h-20 overflow-hidden bg-earth-100">
        {result.image_url ? (
          <img
            src={result.image_url}
            alt={result.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon size={40} className="text-earth-300" />
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={alreadyImported || importing}
          className={`
            absolute top-2.5 right-2.5 rounded-full p-1.5 shadow transition-all duration-200
            ${alreadyImported
              ? 'bg-sage-500 text-white cursor-default'
              : importing
              ? 'bg-white/90 text-earth-400 cursor-wait'
              : 'bg-white/90 text-blue-600 hover:bg-blue-500 hover:text-white'
            }
          `}
          aria-label={alreadyImported ? 'Already imported' : 'Import to catalog'}
        >
          {importing
            ? <Loader2 size={15} className="animate-spin" />
            : <Download size={15} />
          }
        </button>
      </div>

      <div className="p-3.5">
        <div className="mb-1.5">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display font-bold text-earth-900 text-sm uppercase tracking-wide truncate">
              {result.name}
            </h3>
            <span className="shrink-0 text-[9px] bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
              Perenual
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <LightIcon requirement={result.light_requirement} size={12} />
            <Icon size={11} className="text-earth-400 shrink-0" />
            <span className="text-[10px] text-earth-500 uppercase tracking-wider">{result.type}</span>
            <span className="text-[10px] text-earth-400">Z{result.zone_min}–{result.zone_max}</span>
          </div>
        </div>

        {sorted.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
            {sorted.map((m) => (
              <MonthChip key={m} month={m} size="sm" />
            ))}
          </div>
        )}

        {alreadyImported && (
          <p className="text-[10px] text-sage-600 font-medium mt-1.5">Added to your catalog</p>
        )}
      </div>
    </div>
  );
}

export default function CatalogView({
  plants,
  gardenPlantIds,
  userZone,
  onAdd,
  onRemove,
  onSelect,
  onAddCustom,
  onImportPerenual,
  importedPerenualIds,
}: CatalogViewProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PlantType | 'all'>('all');
  const [lightFilter, setLightFilter] = useState<LightRequirement | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [perenualMode, setPerenualMode] = useState(false);

  const filtered = useMemo(() => {
    return plants.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.scientific_name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (lightFilter !== 'all' && p.light_requirement !== lightFilter) return false;
      return true;
    });
  }, [plants, search, typeFilter, lightFilter]);

  const hasActiveFilters = typeFilter !== 'all' || lightFilter !== 'all';
  const showPerenualPrompt = search.trim().length >= 2 && filtered.length === 0 && !perenualMode;

  const { results: perenualResults, loading: perenualLoading, error: perenualError } =
    usePerenualSearch(search, perenualMode);

  function clearSearch() {
    setSearch('');
    setPerenualMode(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-400" />
          <input
            type="text"
            placeholder="Search plants by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-earth-200 rounded-xl text-sm text-earth-800 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition-all"
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={onAddCustom}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-sage-600 hover:bg-sage-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-sage-600/20 shrink-0"
        >
          <Plus size={14} />
          Add Custom
        </button>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border shrink-0
            ${hasActiveFilters
              ? 'bg-sage-50 border-sage-300 text-sage-700'
              : 'bg-white border-earth-200 text-earth-600 hover:border-earth-300'
            }
          `}
        >
          <Filter size={14} />
          Filters
          {hasActiveFilters && (
            <span className="bg-sage-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {(typeFilter !== 'all' ? 1 : 0) + (lightFilter !== 'all' ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white border border-earth-200 rounded-xl p-4 space-y-3 animate-slide-up">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-earth-500 font-semibold mb-2 block">
              Plant Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${typeFilter === f.value
                      ? 'bg-sage-600 text-white'
                      : 'bg-earth-50 text-earth-600 hover:bg-earth-100'
                    }
                  `}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-earth-500 font-semibold mb-2 block">
              Light Requirement
            </label>
            <div className="flex flex-wrap gap-1.5">
              {LIGHT_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setLightFilter(f.value)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${lightFilter === f.value
                      ? 'bg-sage-600 text-white'
                      : 'bg-earth-50 text-earth-600 hover:bg-earth-100'
                    }
                  `}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => { setTypeFilter('all'); setLightFilter('all'); }}
              className="text-xs text-earth-500 hover:text-earth-700 underline underline-offset-2"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <p className="text-xs text-earth-500">
          {perenualMode
            ? `${perenualResults.length} result${perenualResults.length !== 1 ? 's' : ''} from Perenual`
            : `${filtered.length} plant${filtered.length !== 1 ? 's' : ''} found`}
        </p>
        {search.trim().length >= 2 && (
          <button
            onClick={() => setPerenualMode(!perenualMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
              perenualMode
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-blue-600 border-blue-200 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <Search size={10} />
            Perenual
          </button>
        )}
      </div>

      {/* Perenual no-results prompt */}
      {showPerenualPrompt && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-3 animate-slide-up">
          <div>
            <p className="text-sm font-semibold text-blue-800">No catalog matches for "{search}"</p>
            <p className="text-xs text-blue-600 mt-0.5">Search the Perenual plant database instead?</p>
          </div>
          <button
            onClick={() => setPerenualMode(true)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-all"
          >
            <Search size={12} />
            Search Perenual
          </button>
        </div>
      )}

      {/* Perenual results */}
      {perenualMode ? (
        <div className="space-y-3">
          {perenualLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="text-blue-400 animate-spin" />
            </div>
          )}
          {perenualError && (
            <div className="text-center py-8">
              <p className="text-sm text-red-500">{perenualError}</p>
            </div>
          )}
          {!perenualLoading && !perenualError && perenualResults.length === 0 && search.trim().length >= 2 && (
            <div className="text-center py-12">
              <p className="text-earth-400 text-sm">No Perenual results for "{search}".</p>
            </div>
          )}
          {!perenualLoading && perenualResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {perenualResults.map((r) => (
                <PerenualCard
                  key={r.perenual_id}
                  result={r}
                  alreadyImported={importedPerenualIds.has(r.perenual_id)}
                  onImport={async () => { await onImportPerenual(r); }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                isInGarden={gardenPlantIds.has(plant.id)}
                userZone={userZone}
                onAdd={onAdd}
                onRemove={onRemove}
                onClick={onSelect}
              />
            ))}
          </div>

          {filtered.length === 0 && !showPerenualPrompt && (
            <div className="text-center py-16">
              <p className="text-earth-400 text-sm">No plants match your search.</p>
              <button
                onClick={() => { setSearch(''); setTypeFilter('all'); setLightFilter('all'); }}
                className="mt-2 text-sage-600 text-sm font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
