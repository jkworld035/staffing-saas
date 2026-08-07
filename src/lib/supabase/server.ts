import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Use inside Server Components, Server Actions, and Route Handlers.
// NOTE: not parametrized with the Database generic — see the comment in
// lib/supabase/client.ts for why, and swap in `npm run gen:types` output later.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no write access — safe to ignore
            // when middleware is refreshing the session.
          }
        },
      },
    }
  );
}
