import { useState, useEffect, useRef } from 'react';
import type { Plant } from '../types';

export interface PerenualResult extends Omit<Plant, 'id' | 'created_at'> {
  perenual_id: number;
}

export function usePerenualSearch(query: string, enabled: boolean) {
  const [results, setResults] = useState<PerenualResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/perenual-search?q=${encodeURIComponent(query.trim())}`,
          { headers: { Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' } },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Search failed');
        setResults(data.results ?? []);
      } catch (e) {
        setError((e as Error).message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, enabled]);

  return { results, loading, error };
}
