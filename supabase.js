import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const SUPABASE_URL = 'https://phlborstiriwqtyqqwaz.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_wE76tcQFl5sQMDZcGGN3VA_ctAjgCUU';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
