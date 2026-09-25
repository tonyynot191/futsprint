// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// .trim() protects us from stray spaces/newlines in .env values.
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabaseUrl = typeof rawUrl === 'string' ? rawUrl.trim() : '';
const supabaseKey = typeof rawKey === 'string' ? rawKey.trim() : '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

let supabaseInstance = null;

if (isSupabaseConfigured) {
  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'futsprint-auth',
    },
  });
} else {
  // eslint-disable-next-line no-console
  console.warn(
    '[FUTSPrint] Supabase env vars are missing or blank. ' +
      'Copy .env.example to .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY. ' +
      'Auth and data calls will fail until this is set.'
  );
}

export const supabase = supabaseInstance;