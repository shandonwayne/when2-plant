import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Plant, UserGarden, GardenPlant } from '../types';

export function useGarden(userId: string | undefined) {
  const [garden, setGarden] = useState<UserGarden | null>(null);
  const [gardenPlants, setGardenPlants] = useState<GardenPlant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGarden = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const { data: gardens } = await supabase
      .from('user_gardens')
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    let currentGarden = gardens?.[0] ?? null;

    if (!currentGarden) {
      const { data: newGarden } = await supabase
        .from('user_gardens')
        .insert({ user_id: userId, name: 'My Garden', usda_zone: 7 })
        .select()
        .maybeSingle();
      currentGarden = newGarden;
    }

    setGarden(currentGarden);

    if (currentGarden) {
      const { data: gp } = await supabase
        .from('garden_plants')
        .select('*, plant:plants(*)')
        .eq('garden_id', currentGarden.id);
      setGardenPlants(gp ?? []);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchGarden();
  }, [fetchGarden]);

  const addPlant = useCallback(async (plant: Plant) => {
    if (!garden) return;

    const { data, error } = await supabase
      .from('garden_plants')
      .insert({ garden_id: garden.id, plant_id: plant.id })
      .select('*, plant:plants(*)')
      .maybeSingle();

    if (!error && data) {
      setGardenPlants((prev) => [...prev, data]);
    }
  }, [garden]);

  const removePlant = useCallback(async (plantId: string) => {
    if (!garden) return;

    await supabase
      .from('garden_plants')
      .delete()
      .eq('garden_id', garden.id)
      .eq('plant_id', plantId);

    setGardenPlants((prev) => prev.filter((gp) => gp.plant_id !== plantId));
  }, [garden]);

  const updateZone = useCallback(async (zone: number) => {
    if (!garden) return;

    const { data } = await supabase
      .from('user_gardens')
      .update({ usda_zone: zone, updated_at: new Date().toISOString() })
      .eq('id', garden.id)
      .select()
      .maybeSingle();

    if (data) setGarden(data);
  }, [garden]);

  return {
    garden,
    gardenPlants,
    loading,
    addPlant,
    removePlant,
    updateZone,
  };
}
