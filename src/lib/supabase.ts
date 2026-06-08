import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | undefined;

function requireSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL ortam değişkeni tanımlı değil.");
  }

  if (!anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY ortam değişkeni tanımlı değil.");
  }

  return { url, anonKey };
}

/** Lazy singleton — build sırasında env yoksa modül import'u patlamaz. */
export function getSupabase(): SupabaseClient {
  if (!cachedClient) {
    const { url, anonKey } = requireSupabaseConfig();
    cachedClient = createClient(url, anonKey);
  }
  return cachedClient;
}

/** @deprecated getSupabase() kullanın */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export function createSupabaseAdmin(): SupabaseClient {
  const { url } = requireSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY ortam değişkeni tanımlı değil.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
