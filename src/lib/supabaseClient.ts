import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ofkdgsgblxxpacefsmcf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ma2Rnc2dibHh4cGFjZWZzbWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTgxMzgsImV4cCI6MjA5Mzc3NDEzOH0.Zg1kFW3hIB_Vj1Z9jK4TvZnpdwEiBDvELDshHBZoe7E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
