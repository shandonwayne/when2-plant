export type PlantType = 'flower' | 'vegetable' | 'herb' | 'shrub';
export type LightRequirement = 'full_sun' | 'partial_sun' | 'shade';
export type WaterNeeds = 'low' | 'moderate' | 'high';

export interface Plant {
  id: string;
  name: string;
  scientific_name: string;
  type: PlantType;
  description: string;
  image_url: string;
  closeup_image_url: string;
  light_requirement: LightRequirement;
  zone_min: number;
  zone_max: number;
  bloom_months: number[];
  planting_months: number[];
  harvest_months: number[];
  days_to_maturity: number;
  height_inches_min: number;
  height_inches_max: number;
  water_needs: WaterNeeds;
  created_at: string;
}

export interface UserGarden {
  id: string;
  user_id: string;
  name: string;
  usda_zone: number;
  created_at: string;
  updated_at: string;
}

export interface GardenPlant {
  id: string;
  garden_id: string;
  plant_id: string;
  notes: string;
  added_at: string;
  plant?: Plant;
}

export type ViewMode = 'catalog' | 'garden';

export interface CustomPlant extends Plant {
  user_id: string;
  is_custom: true;
}
