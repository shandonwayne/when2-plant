import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PERENUAL_BASE = "https://perenual.com/api/v2";

const PLANT_QUERIES: { query: string; type: string }[] = [
  // Flowers
  { query: "Lavender", type: "flower" },
  { query: "Sunflower", type: "flower" },
  { query: "Marigold", type: "flower" },
  { query: "Zinnia", type: "flower" },
  { query: "Dahlia", type: "flower" },
  { query: "Peony", type: "flower" },
  { query: "Tulip", type: "flower" },
  { query: "Daffodil", type: "flower" },
  { query: "Coneflower", type: "flower" },
  { query: "Black-Eyed Susan", type: "flower" },
  { query: "Chrysanthemum", type: "flower" },
  { query: "Hydrangea", type: "flower" },
  // Vegetables
  { query: "Tomato", type: "vegetable" },
  { query: "Bell Pepper", type: "vegetable" },
  { query: "Zucchini", type: "vegetable" },
  { query: "Cucumber", type: "vegetable" },
  { query: "Lettuce", type: "vegetable" },
  { query: "Carrot", type: "vegetable" },
  { query: "Spinach", type: "vegetable" },
  { query: "Kale", type: "vegetable" },
  { query: "Broccoli", type: "vegetable" },
  { query: "Garlic", type: "vegetable" },
  { query: "Pumpkin", type: "vegetable" },
  { query: "Green Bean", type: "vegetable" },
  // Herbs
  { query: "Basil", type: "herb" },
  { query: "Rosemary", type: "herb" },
  { query: "Mint", type: "herb" },
  { query: "Cilantro", type: "herb" },
  { query: "Thyme", type: "herb" },
  { query: "Dill", type: "herb" },
  { query: "Oregano", type: "herb" },
  { query: "Parsley", type: "herb" },
  { query: "Chives", type: "herb" },
  { query: "Sage", type: "herb" },
  // Shrubs
  { query: "Blueberry", type: "shrub" },
  { query: "Raspberry", type: "shrub" },
  { query: "Rose", type: "shrub" },
  { query: "Butterfly Bush", type: "shrub" },
  { query: "Azalea", type: "shrub" },
];

const SEASON_TO_MONTHS: Record<string, number[]> = {
  spring: [3, 4, 5],
  "early spring": [3, 4],
  "mid spring": [4, 5],
  "late spring": [5, 6],
  summer: [6, 7, 8],
  "early summer": [6, 7],
  "mid summer": [7, 8],
  "late summer": [8, 9],
  fall: [9, 10, 11],
  autumn: [9, 10, 11],
  "early fall": [9, 10],
  "late fall": [10, 11],
  winter: [12, 1, 2],
  "early winter": [11, 12],
  "late winter": [1, 2],
};

function seasonToMonths(season: string | null | undefined): number[] {
  if (!season) return [];
  const lower = season.toLowerCase().trim();

  if (SEASON_TO_MONTHS[lower]) return SEASON_TO_MONTHS[lower];

  for (const [key, months] of Object.entries(SEASON_TO_MONTHS)) {
    if (lower.includes(key)) return months;
  }

  return [];
}

const PLANTING_MONTHS: Record<string, number[]> = {
  Tomato: [3, 4, 5],
  "Bell Pepper": [3, 4, 5],
  Zucchini: [4, 5, 6],
  Cucumber: [4, 5, 6],
  Lettuce: [3, 4, 5, 8, 9],
  Carrot: [3, 4, 5, 8, 9],
  Spinach: [2, 3, 4, 9, 10],
  Kale: [2, 3, 4, 8, 9],
  Broccoli: [3, 4, 8, 9],
  Garlic: [9, 10, 11],
  Pumpkin: [5, 6],
  "Green Bean": [4, 5, 6],
  Basil: [4, 5, 6],
  Rosemary: [3, 4, 5],
  Mint: [3, 4, 5],
  Cilantro: [3, 4, 9, 10],
  Thyme: [3, 4, 5],
  Dill: [4, 5],
  Oregano: [3, 4, 5],
  Parsley: [3, 4, 5],
  Chives: [3, 4, 5],
  Sage: [3, 4, 5],
  Lavender: [3, 4, 5],
  Sunflower: [4, 5, 6],
  Marigold: [4, 5],
  Zinnia: [4, 5, 6],
  Dahlia: [4, 5],
  Peony: [9, 10, 11],
  Tulip: [9, 10, 11],
  Daffodil: [9, 10, 11],
  Coneflower: [3, 4, 5],
  "Black-Eyed Susan": [3, 4, 5],
  Chrysanthemum: [3, 4, 5],
  Hydrangea: [3, 4, 5],
  Blueberry: [3, 4, 5],
  Raspberry: [3, 4],
  Rose: [3, 4, 5],
  "Butterfly Bush": [3, 4, 5],
  Azalea: [3, 4, 5],
};

const HARVEST_MONTHS: Record<string, number[]> = {
  Tomato: [7, 8, 9, 10],
  "Bell Pepper": [7, 8, 9],
  Zucchini: [6, 7, 8, 9],
  Cucumber: [6, 7, 8, 9],
  Lettuce: [5, 6, 10, 11],
  Carrot: [6, 7, 8, 10, 11],
  Spinach: [4, 5, 6, 10, 11],
  Kale: [5, 6, 7, 10, 11, 12],
  Broccoli: [5, 6, 10, 11],
  Garlic: [6, 7],
  Pumpkin: [9, 10],
  "Green Bean": [6, 7, 8, 9],
  Blueberry: [6, 7, 8],
  Raspberry: [6, 7, 8],
};

function mapSunlight(sunlight: string[] | null | undefined): string {
  if (!sunlight || sunlight.length === 0) return "full_sun";
  const first = sunlight[0].toLowerCase();
  if (first.includes("full shade") || first.includes("shade")) return "shade";
  if (first.includes("part")) return "partial_sun";
  return "full_sun";
}

function mapWatering(watering: string | null | undefined): string {
  if (!watering) return "moderate";
  const lower = watering.toLowerCase();
  if (lower === "frequent") return "high";
  if (lower === "minimum" || lower === "none") return "low";
  return "moderate";
}

function feetToInches(
  val: number | null | undefined,
): number {
  if (!val || val <= 0) return 0;
  return Math.round(val * 12);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const perenualKey = Deno.env.get("PERENUAL_API_KEY");
    if (!perenualKey) {
      return new Response(
        JSON.stringify({ error: "PERENUAL_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: { name: string; status: string; perenual_id?: number }[] = [];
    let apiCalls = 0;

    for (const entry of PLANT_QUERIES) {
      try {
        // Search for the plant
        const listUrl =
          `${PERENUAL_BASE}/species-list?key=${perenualKey}&q=${encodeURIComponent(entry.query)}`;
        const listRes = await fetch(listUrl);
        apiCalls++;

        if (!listRes.ok) {
          results.push({ name: entry.query, status: `list-error-${listRes.status}` });
          continue;
        }

        const listData = await listRes.json();
        if (!listData.data || listData.data.length === 0) {
          results.push({ name: entry.query, status: "not-found" });
          continue;
        }

        const bestMatch = listData.data[0];
        const speciesId = bestMatch.id;

        // Fetch details
        const detailUrl =
          `${PERENUAL_BASE}/species/details/${speciesId}?key=${perenualKey}`;
        const detailRes = await fetch(detailUrl);
        apiCalls++;

        if (!detailRes.ok) {
          results.push({
            name: entry.query,
            status: `detail-error-${detailRes.status}`,
            perenual_id: speciesId,
          });
          continue;
        }

        const detail = await detailRes.json();

        const imageUrl =
          detail.default_image?.regular_url ||
          detail.default_image?.medium_url ||
          detail.default_image?.original_url ||
          "";
        const thumbUrl =
          detail.default_image?.thumbnail ||
          detail.default_image?.small_url ||
          imageUrl;

        const bloomMonths = seasonToMonths(detail.flowering_season);
        const harvestMonths =
          HARVEST_MONTHS[entry.query] ||
          seasonToMonths(detail.harvest_season);
        const plantingMonths =
          PLANTING_MONTHS[entry.query] || [];

        const dimensions = detail.dimensions;
        let heightMin = 0;
        let heightMax = 0;
        if (dimensions) {
          heightMin = feetToInches(dimensions.min_value);
          heightMax = feetToInches(dimensions.max_value);
        }

        const zoneMin = detail.hardiness?.min
          ? parseInt(String(detail.hardiness.min).replace(/[ab]/i, ""))
          : 3;
        const zoneMax = detail.hardiness?.max
          ? parseInt(String(detail.hardiness.max).replace(/[ab]/i, ""))
          : 10;

        const plantRow = {
          name: detail.common_name || entry.query,
          scientific_name:
            (detail.scientific_name && detail.scientific_name[0]) || "",
          type: entry.type,
          description: `${detail.common_name || entry.query} (${detail.cycle || "Perennial"}). ${detail.care_level ? "Care level: " + detail.care_level + "." : ""}`,
          image_url: imageUrl,
          closeup_image_url: thumbUrl,
          light_requirement: mapSunlight(detail.sunlight),
          zone_min: isNaN(zoneMin) ? 3 : Math.max(1, zoneMin),
          zone_max: isNaN(zoneMax) ? 10 : Math.min(13, zoneMax),
          bloom_months: bloomMonths,
          planting_months: plantingMonths,
          harvest_months: harvestMonths,
          days_to_maturity: 0,
          height_inches_min: heightMin,
          height_inches_max: heightMax,
          water_needs: mapWatering(detail.watering),
          perenual_id: speciesId,
        };

        const { error } = await supabase
          .from("plants")
          .upsert(plantRow, { onConflict: "perenual_id" });

        if (error) {
          results.push({
            name: entry.query,
            status: `db-error: ${error.message}`,
            perenual_id: speciesId,
          });
        } else {
          results.push({
            name: entry.query,
            status: "ok",
            perenual_id: speciesId,
          });
        }

        // Respect rate limits
        await delay(300);
      } catch (err) {
        results.push({
          name: entry.query,
          status: `error: ${(err as Error).message}`,
        });
      }
    }

    const summary = {
      total: PLANT_QUERIES.length,
      success: results.filter((r) => r.status === "ok").length,
      failed: results.filter((r) => r.status !== "ok").length,
      api_calls: apiCalls,
      results,
    };

    return new Response(JSON.stringify(summary, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
