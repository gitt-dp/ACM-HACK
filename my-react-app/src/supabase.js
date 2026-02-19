import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gegmkjveiggkluwfdthj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZ21ranZlaWdna2x1d2ZkdGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTYzOTEsImV4cCI6MjA4Njk5MjM5MX0.2OpD60TLHSeygwuyfPYFW91YAXFuO_q4Kpsy6NBqufw";

export const supabase = createClient(supabaseUrl, supabaseKey);
