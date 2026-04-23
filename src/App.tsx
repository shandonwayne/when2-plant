import { useState, useMemo } from 'react';
import { Sprout, BookOpen, Flower2, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { usePlants } from './hooks/usePlants';
import { useGarden } from './hooks/useGarden';
import AuthForm from './components/AuthForm';
import CatalogView from './components/CatalogView';
import GardenView from './components/GardenView';
import ZoneSelector from './components/ZoneSelector';
import PlantDetailModal from './components/PlantDetailModal';
import ClimateZoneWarning from './components/ClimateZoneWarning';
import AddCustomPlantModal from './components/AddCustomPlantModal';
import type { Plant, ViewMode } from './types';
import type { PerenualResult } from './hooks/usePerenualSearch';

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { plants, loading: plantsLoading, createCustomPlant, importPerenualPlant, importedPerenualIds } = usePlants(user?.id);
  const { garden, gardenPlants, loading: gardenLoading, addPlant, removePlant, updateZone } = useGarden(user?.id);

  const [view, setView] = useState<ViewMode>('catalog');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [warningPlant, setWarningPlant] = useState<Plant | null>(null);
  const [showAddCustom, setShowAddCustom] = useState(false);

  const gardenPlantIds = useMemo(
    () => new Set(gardenPlants.map((gp) => gp.plant_id)),
    [gardenPlants]
  );

  const gardenPlantsList = useMemo(
    () => gardenPlants.map((gp) => gp.plant as Plant).filter(Boolean),
    [gardenPlants]
  );

  const handleAdd = (plant: Plant) => {
    const zone = garden?.usda_zone ?? null;
    if (zone !== null && (zone < plant.zone_min || zone > plant.zone_max)) {
      setWarningPlant(plant);
    } else {
      addPlant(plant);
    }
  };

  const handleConfirmAdd = () => {
    if (warningPlant) {
      addPlant(warningPlant);
      setWarningPlant(null);
    }
  };

  const handleSaveCustomPlant = async (fields: Parameters<typeof createCustomPlant>[1]) => {
    if (!user) return;
    const plant = await createCustomPlant(user.id, fields);
    setShowAddCustom(false);
    if (plant) addPlant(plant);
  };

  const handleImportPerenual = async (result: PerenualResult): Promise<Plant | null> => {
    if (!user) return null;
    return importPerenualPlant(user.id, result);
  };

  const handleRemove = (plant: Plant) => {
    removePlant(plant.id);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center">
        <Loader2 size={28} className="text-sage-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />;
  }

  const isLoading = plantsLoading || gardenLoading;

  return (
    <div className="min-h-screen bg-earth-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-earth-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sage-100 rounded-lg flex items-center justify-center">
              <Sprout size={18} className="text-sage-600" />
            </div>
            <h1 className="font-display text-lg font-bold text-earth-900 tracking-tight hidden sm:block">
              Garden Planner
            </h1>
          </div>

          <nav className="flex items-center gap-1 bg-earth-100 rounded-xl p-1">
            <button
              onClick={() => setView('catalog')}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${view === 'catalog'
                  ? 'bg-white text-earth-900 shadow-sm'
                  : 'text-earth-500 hover:text-earth-700'
                }
              `}
            >
              <BookOpen size={14} />
              Catalog
            </button>
            <button
              onClick={() => setView('garden')}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${view === 'garden'
                  ? 'bg-white text-earth-900 shadow-sm'
                  : 'text-earth-500 hover:text-earth-700'
                }
              `}
            >
              <Flower2 size={14} />
              My Garden
              {gardenPlants.length > 0 && (
                <span className="bg-sage-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold px-1">
                  {gardenPlants.length}
                </span>
              )}
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <ZoneSelector
              zone={garden?.usda_zone ?? null}
              onZoneChange={updateZone}
              compact
            />
            <button
              onClick={signOut}
              className="text-earth-400 hover:text-earth-600 transition-colors p-1.5"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="text-sage-600 animate-spin" />
          </div>
        ) : view === 'catalog' ? (
          <CatalogView
            plants={plants}
            gardenPlantIds={gardenPlantIds}
            userZone={garden?.usda_zone ?? null}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onSelect={setSelectedPlant}
            onAddCustom={() => setShowAddCustom(true)}
            onImportPerenual={handleImportPerenual}
            importedPerenualIds={importedPerenualIds}
          />
        ) : (
          <GardenView
            plants={gardenPlantsList}
            userZone={garden?.usda_zone ?? null}
            onRemove={handleRemove}
            onSelect={setSelectedPlant}
          />
        )}
      </main>

      {selectedPlant && (
        <PlantDetailModal
          plant={selectedPlant}
          isInGarden={gardenPlantIds.has(selectedPlant.id)}
          userZone={garden?.usda_zone ?? null}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onClose={() => setSelectedPlant(null)}
        />
      )}

      {warningPlant && (
        <ClimateZoneWarning
          plant={warningPlant}
          userZone={garden?.usda_zone ?? 7}
          onConfirm={handleConfirmAdd}
          onCancel={() => setWarningPlant(null)}
        />
      )}

      {showAddCustom && user && (
        <AddCustomPlantModal
          userId={user.id}
          onSave={handleSaveCustomPlant}
          onClose={() => setShowAddCustom(false)}
        />
      )}
    </div>
  );
}

export default App;
