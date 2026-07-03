import { createClient } from '@supabase/supabase-js';

// Using your direct live keys from your Supabase project dashboard
const supabaseUrl = "https://gkzuepniuiobfbgqubba.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrenVlcG5pdWlvYmZiZ3F1YmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMzcxMzUsImV4cCI6MjA5ODYxMzEzNX0.JvHw0hZpW6y9jSOYkh0hFhlg_EGwAX-txOCwQ9le4tY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);