// This file was automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Safe, memoized Supabase client helper for both client and server.
 * - Prevents race double-initialization by guarding with a promise
 * - Separates browser persistence logic from SSR/server usage
 */

let clientPromise: Promise<ReturnType<typeof createClient<Database>>> | null = null;
let _client: ReturnType<typeof createClient<Database>> | null = null;

function getEnv(keyBrowser: string, keyServer: string) {
  // Vite exposes import.meta.env.VITE_* at build time in the browser
  // Server (SSR) should use process.env
  const browserVal = typeof import.meta !== 'undefined' ? (import.meta as any)["env"]?.[keyBrowser] : undefined;
  const serverVal = typeof process !== 'undefined' ? (process.env as any)[keyServer] : undefined;
  return browserVal ?? serverVal;
}

function createSupabaseClientInternal() {
  const SUPABASE_URL = getEnv('VITE_SUPABASE_URL', 'SUPABASE_URL');
  const SUPABASE_PUBLISHABLE_KEY = getEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_PUBLISHABLE_KEY');

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ['SUPABASE_URL/VITE_SUPABASE_URL'] : []),
      ...(!SUPABASE_PUBLISHABLE_KEY ? ['SUPABASE_PUBLISHABLE_KEY/VITE_SUPABASE_PUBLISHABLE_KEY'] : []),
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(', ')}.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  const isBrowser = typeof window !== 'undefined';

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      // Only enable client persistence in a browser environment
      storage: isBrowser ? (localStorage as unknown as Storage) : undefined,
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
    },
    // Optionally add global fetch or other settings here
  });
}

export async function getSupabaseClient() {
  if (_client) return _client;
  if (!clientPromise) {
    clientPromise = Promise.resolve().then(() => {
      _client = createSupabaseClientInternal();
      return _client as ReturnType<typeof createSupabaseClientInternal>;
    });
  }
  return clientPromise;
}

/**
 * Create a server-only Supabase client using the service role key.
 * Use this only in server contexts and keep the SERVICE_ROLE key secret.
 */
export function createServiceRoleClient(serviceRoleKey?: string) {
  const SUPABASE_URL = getEnv('VITE_SUPABASE_URL', 'SUPABASE_URL');
  const key = serviceRoleKey ?? (typeof process !== 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined);
  if (!SUPABASE_URL || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for service role client');
  }
  return createClient<Database>(SUPABASE_URL, key, { auth: { persistSession: false } });
}

// Backwards-compatible export used in many files
// import { supabase } from "./client"
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClientInternal>, {
  get(_, prop: string | symbol, receiver) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getSupabaseClient();
    if (!_client) throw new Error('Supabase client not initialized yet');
    // @ts-ignore
    return Reflect.get(_client, prop, receiver);
  },
});
