import { createBrowserClient } from "@supabase/ssr";

// Use inside client components ("use client").
// NOTE: not parametrized with the Database generic on purpose — the hand-authored
// types in src/types/database.types.ts are for app-level typing (component props,
// calculation inputs), not wired into the Supabase client itself. Once the project
// is linked and `npm run gen:types` produces the real generated types, pass that
// type here as createBrowserClient<Database>(...) for full query-level type safety.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
