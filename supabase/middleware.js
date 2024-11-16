import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(request) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const cookies = request.cookies;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        async get(name) {
          return (await cookies.get(name))?.value;
        },
        async set(name, value, options) {
          cookies.set({
            name,
            value,
            ...options,
          });
          response.cookies.set(name, value, options);
        },
        async remove(name, options) {
          cookies.set({
            name,
            value: "",
            ...options,
          });
          response.cookies.set(name, "", options);
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}
