/**
 * Supabase server-side klient pro API routes
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn(
    "Supabase: Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY"
  );
}

export const supabase =
  url && serviceKey
    ? createClient(url, serviceKey, {
        auth: { persistSession: false },
      })
    : null;
