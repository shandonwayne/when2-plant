import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PERENUAL_BASE = "https://perenual.com/api/v2";

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

function mapType(cycle: string | null | undefined): string {
  if (!cycle) return "flower";
  const lower = cycle.toLowerCase();
  if (lower.includes("annual") || lower.includes("biennial")) return "flower";
  return "flower";
}

function feetToInches(val: number | null | undefined): number {
  if (!val || val <= 0) return 0;
  return Math.round(val * 12);
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

    const url = new URL(req.url);
    const query = url.searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const listUrl = `${PERENUAL_BASE}/species-list?key=${perenualKey}&q=${encodeURIComponent(query.trim())}&per_page=6`;
    const listRes = await fetch(listUrl);

    if (!listRes.ok) {
      return new Response(
        JSON.stringify({ error: `Perenual API error: ${listRes.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const listData = await listRes.json();
    const items = (listData.data ?? []).slice(0, 6);

    // Map list results into plant-compatible objects (no detail call to stay fast)
    const results = items.map((item: Record<string, unknown>) => {
      const defaultImage = item.default_image as Record<string, string> | null;
      const imageUrl =
        defaultImage?.regular_url ||
        defaultImage?.medium_url ||
        defaultImage?.original_url ||
        "";
      const thumbUrl =
        defaultImage?.thumbnail ||
        defaultImage?.small_url ||
        imageUrl;

      const hardiness = item.hardiness as { min?: string; max?: string } | null;
      const zoneMinRaw = hardiness?.min ? parseInt(String(hardiness.min).replace(/[ab]/i, "")) : 3;
      const zoneMaxRaw = hardiness?.max ? parseInt(String(hardiness.max).replace(/[ab]/i, "")) : 10;
      const zoneMin = isNaN(zoneMinRaw) ? 3 : Math.max(1, zoneMinRaw);
      const zoneMax = isNaN(zoneMaxRaw) ? 10 : Math.min(13, zoneMaxRaw);

      const sunlight = item.sunlight as string[] | null;
      const watering = item.watering as string | null;
      const cycle = item.cycle as string | null;
      const scientificName = item.scientific_name as string[] | null;
      const floweringSeason = item.flowering_season as string | null;

      const dimensions = item.dimensions as { min_value?: number; max_value?: number } | null;

      return {
        perenual_id: item.id as number,
        name: (item.common_name as string) || (scientificName?.[0] ?? "Unknown"),
        scientific_name: scientificName?.[0] ?? "",
        type: mapType(cycle),
        description: `${(item.common_name as string) || ""} (${cycle || "Perennial"}).`,
        image_url: imageUrl,
        closeup_image_url: thumbUrl,
        light_requirement: mapSunlight(sunlight),
        zone_min: zoneMin,
        zone_max: zoneMax,
        bloom_months: seasonToMonths(floweringSeason),
        planting_months: [],
        harvest_months: [],
        days_to_maturity: 0,
        height_inches_min: feetToInches(dimensions?.min_value),
        height_inches_max: feetToInches(dimensions?.max_value),
        water_needs: mapWatering(watering),
      };
    });

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
