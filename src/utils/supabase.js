import { createClient } from '@supabase/supabase-js';

// Reads from environment variables if present, or defaults to null
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper to optionally sync data to Supabase if configured.
 * When Supabase is not configured, silently succeeds as localStorage is the primary offline store.
 */
export async function syncToSupabase(table, data) {
  if (!supabase) return { data: null, error: null };
  try {
    const { data: result, error } = await supabase.from(table).upsert(data);
    return { data: result, error };
  } catch (err) {
    console.warn('Supabase sync skipped/failed:', err);
    return { data: null, error: err };
  }
}
