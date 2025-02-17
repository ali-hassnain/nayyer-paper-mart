// File: ./supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Create a single NextResponse object.
  const response = NextResponse.next()

  // Create your Supabase server client with the provided NEXT_PUBLIC env keys.
  const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // Read cookies from the incoming request.
          getAll: () => request.cookies.getAll(),
          // Write cookies only to the response.
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
  )

  // Optionally, you can use the supabase client to perform user/session checks.
  // For example:
  //
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user && !request.nextUrl.pathname.startsWith('/auth')) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/auth/login'
  //   return NextResponse.redirect(url)
  // }

  // Return the response with the updated cookies.
  return response
}
