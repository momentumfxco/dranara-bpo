import { createClient } from "@supabase/supabase-js";

// Client apontando diretamente ao projeto Supabase do consultório (Dra Nara).
// A anon key é publishable — seguro estar no bundle client.
const SUPABASE_URL = "https://vfhsvzvbnfuavtjxwmxu.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmaHN2enZibmZ1YXZ0anh3bXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzOTY3NDcsImV4cCI6MjA5OTk3Mjc0N30.5EglUi02epOuGVU17sIYZMS3yfdDWptXjQu1JA4HTQ8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "consultorio-dra-nara-auth",
  },
});
