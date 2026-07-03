import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseUrl = "https://gkzuepniuiobfbgqubba.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrenVlcG5pdWlvYmZiZ3F1YmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMzcxMzUsImV4cCI6MjA5ODYxMzEzNX0.JvHw0hZpW6y9jSOYkh0hFhlg_EGwAX-txOCwQ9le4tY";

// We use "export const" so it can be cleanly destructured as { supabase }
export const supabase = createClient(supabaseUrl, supabaseAnonKey);