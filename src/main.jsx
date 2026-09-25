import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// TEMP: Phase 1 smoke test — remove once Phase 2 starts
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
console.log('[FUTSPrint] Supabase configured?', isSupabaseConfigured);
console.log('[FUTSPrint] Supabase client type?', supabase ? typeof supabase.auth.getSession : 'null (not configured)');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)