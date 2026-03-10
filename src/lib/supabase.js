import { createClient } from "@supabase/supabase-js";

// Acesse essas chaves nas configurações (API) do seu projeto Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
