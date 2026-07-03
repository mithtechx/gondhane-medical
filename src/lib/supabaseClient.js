import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// We use "export const" so it can be cleanly destructured as { supabase }
export const supabase = createClient(supabaseUrl, supabaseAnonKey);