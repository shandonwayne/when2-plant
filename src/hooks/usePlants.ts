import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Plant } from '../types';
import type { PerenualResult } from './usePerenualSearch';

export function usePlants(userId?: string) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlants = useCallback(async () => {
    const [catalogRes, customRes] = await Promise.all([
      supabase.from('plants').select('*').order('name'),
      userId
        ? supabase.from('custom_plants').select('*').eq('user_id', userId).order('name')
        : Promise.resolve({ data: [] }),
    ]);

    const catalog = (catalogRes.data ?? []) as Plant[];
    const custom = ((customRes as { data: unknown[] | null }).data ?? []).map((p) => ({
      ...(p as Plant),
      is_custom: true as const,
    }));

    setPlants([...catalog, ...custom]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  // Track perenual_ids that have already been imported by this user
  const importedPerenualIds = useMemo<Set<number>>(() => {
    const ids = new Set<number>();
    for (const p of plants) {
      const perenualId = (p as Plant & { perenual_id?: number }).perenual_id;
      if (perenualId) ids.add(perenualId);
    }
    return ids;
  }, [plants]);

  async function createCustomPlant(
    userId: string,
    fields: Omit<Plant, 'id' | 'created_at' | 'closeup_image_url'> & { perenual_id?: number }
  ): Promise<Plant | null> {
    const { data, error } = await supabase
      .from('custom_plants')
      .insert({ ...fields, user_id: userId, closeup_image_url: fields.image_url })
      .select()
      .single();
    if (error || !data) return null;
    const plant = { ...(data as Plant), is_custom: true as const };
    setPlants((prev) => [...prev, plant]);
    return plant;
  }

  async function importPerenualPlant(userId: string, result: PerenualResult): Promise<Plant | null> {
    const fields = {
      name: result.name,
      scientific_name: result.scientific_name,
      type: result.type,
      description: result.description,
      image_url: result.image_url,
      closeup_image_url: result.closeup_image_url,
      light_requirement: result.light_requirement,
      zone_min: result.zone_min,
      zone_max: result.zone_max,
      bloom_months: result.bloom_months,
      planting_months: result.planting_months,
      harvest_months: result.harvest_months,
      days_to_maturity: result.days_to_maturity,
      height_inches_min: result.height_inches_min,
      height_inches_max: result.height_inches_max,
      water_needs: result.water_needs,
      perenual_id: result.perenual_id,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from('custom_plants')
      .insert(fields)
      .select()
      .single();
    if (error || !data) return null;
    const plant = { ...(data as Plant), is_custom: true as const };
    setPlants((prev) => [...prev, plant]);
    return plant;
  }

  async function deleteCustomPlant(plantId: string) {
    await supabase.from('custom_plants').delete().eq('id', plantId);
    setPlants((prev) => prev.filter((p) => p.id !== plantId));
  }

  return { plants, loading, createCustomPlant, importPerenualPlant, deleteCustomPlant, importedPerenualIds };
}
